import { randomUUID } from "node:crypto";
import Joi from "joi";
import * as supportRepository from "../repositories/support-ticket.repository.js";
import withTransaction from "../utils/transaction.js";
import ApiError from "../utils/ApiError.js";
import { createNotification } from "./notification.service.js";
import {
    createSupportTicketSchema,
    supportMessageSchema,
    updateSupportTicketSchema
} from "../validations/support-ticket.validation.js";

const categories = [
    "ORDER", "PAYMENT", "SHIPPING", "RETURNS", "PRODUCT", "ACCOUNT", "OTHER"
];
const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const priorities = ["LOW", "NORMAL", "HIGH", "URGENT"];

const listQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).max(Number.MAX_SAFE_INTEGER).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
    status: Joi.string().valid(...statuses).allow(""),
    category: Joi.string().valid(...categories).allow(""),
    priority: Joi.string().valid(...priorities).allow(""),
    search: Joi.string().trim().max(100).allow("")
});
const messageQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).max(Number.MAX_SAFE_INTEGER).default(1),
    limit: Joi.number().integer().min(1).max(50).default(30)
});

function parseId(value, label) {
    const { error, value: id } = Joi.number()
        .integer()
        .positive()
        .max(Number.MAX_SAFE_INTEGER)
        .validate(value);
    if (error) throw new ApiError(400, `Invalid ${label}.`);
    return id;
}

function parseQuery(schema, query) {
    const { error, value } = schema.validate(query, {
        abortEarly: false,
        convert: true,
        stripUnknown: true
    });
    if (error) {
        throw new ApiError(400, error.details.map((item) => item.message).join(" "));
    }
    const offset = (value.page - 1) * value.limit;
    if (!Number.isSafeInteger(offset)) throw new ApiError(400, "Page is too large.");
    return { ...value, offset };
}

function validateCreateInput(input) {
    const { error, value } = createSupportTicketSchema.validate(input, { abortEarly: false });
    if (error) throw new ApiError(400, error.details.map((item) => item.message).join(" "));
    return value;
}

function validateMessage(input) {
    const { error, value } = supportMessageSchema.validate({ message: input });
    if (error) throw new ApiError(400, "Message must be between 2 and 5000 characters.");
    return value.message;
}

async function sendNotificationBestEffort(input) {
    try {
        await createNotification(input);
    } catch (error) {
        console.error("Support ticket notification failed:", error.message);
    }
}

function customerNotification(userId, ticketId, event, title, message) {
    return {
        userId,
        eventKey: event,
        type: "SUPPORT_TICKET_UPDATE",
        title,
        message,
        data: { support_ticket_id: ticketId },
        sendEmail: true
    };
}

async function notifyAdmins(ticketId, messageId, title, message) {
    try {
        const adminIds = await supportRepository.findActiveAdminIds();
        await Promise.all(adminIds.map((adminId) => sendNotificationBestEffort({
            userId: adminId,
            eventKey: `support-ticket:${ticketId}:message:${messageId}:admin:${adminId}`,
            type: "SUPPORT_TICKET_UPDATE",
            title,
            message,
            data: { support_ticket_id: ticketId, support_admin_view: true },
            sendEmail: true
        })));
    } catch (error) {
        console.error("Support ticket admin notification failed:", error.message);
    }
}

export async function createSupportTicket(userId, input) {
    const customerId = parseId(userId, "user ID");
    const data = validateCreateInput(input);
    const ticket = await withTransaction(async (connection) => {
        const ticketId = await supportRepository.insertTicket(connection, {
            customerId,
            subject: data.subject,
            category: data.category,
            priority: data.priority
        });
        const messageId = await supportRepository.insertTicketMessage(connection, {
            ticketId,
            senderId: customerId,
            senderRole: "CUSTOMER",
            message: data.message
        });
        return { ticketId, messageId };
    });

    await sendNotificationBestEffort(customerNotification(
        customerId,
        ticket.ticketId,
        `support-ticket:${ticket.ticketId}:created`,
        "Support request received",
        `Your support ticket #${ticket.ticketId} has been received.`
    ));
    await notifyAdmins(
        ticket.ticketId,
        ticket.messageId,
        "New support ticket",
        `A new support ticket #${ticket.ticketId} is waiting for a response.`
    );
    return { ticket_id: ticket.ticketId, status: "OPEN" };
}

export async function getCustomerTickets(userId, query = {}) {
    const customerId = parseId(userId, "user ID");
    const filters = parseQuery(listQuerySchema, query);
    const params = {
        status: filters.status || null,
        category: filters.category || null,
        priority: filters.priority || null,
        search: filters.search || null,
        limit: filters.limit,
        offset: filters.offset
    };
    const [total, tickets] = await Promise.all([
        supportRepository.countTickets({
            customerId,
            ...params
        }),
        supportRepository.listCustomerTickets(customerId, params)
    ]);
    return {
        tickets,
        pagination: {
            page: filters.page,
            limit: filters.limit,
            total,
            total_pages: Math.ceil(total / filters.limit)
        }
    };
}

async function getTicketMessages(ticketId, query) {
    const pagination = parseQuery(messageQuerySchema, query);
    const [total, messages] = await Promise.all([
        supportRepository.countTicketMessages(ticketId),
        supportRepository.listTicketMessages(ticketId, pagination)
    ]);
    return {
        messages,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            total_pages: Math.ceil(total / pagination.limit)
        }
    };
}

export async function getCustomerTicket(userId, ticketId, query = {}) {
    const customerId = parseId(userId, "user ID");
    const id = parseId(ticketId, "ticket ID");
    const ticket = await supportRepository.getCustomerTicket(customerId, id);
    if (!ticket) throw new ApiError(404, "Support ticket not found.");
    return { ticket, ...(await getTicketMessages(id, query)) };
}

export async function replyAsCustomer(userId, ticketId, text) {
    const customerId = parseId(userId, "user ID");
    const id = parseId(ticketId, "ticket ID");
    const message = validateMessage(text);
    const result = await withTransaction(async (connection) => {
        const ticket = await supportRepository.lockTicket(connection, id);
        if (!ticket || Number(ticket.customer_id) !== customerId) {
            throw new ApiError(404, "Support ticket not found.");
        }
        if (ticket.status === "CLOSED") {
            throw new ApiError(409, "This ticket is closed. Create a new ticket to continue.");
        }
        if (ticket.status === "RESOLVED") {
            await supportRepository.updateTicket(connection, id, { status: "OPEN" });
        }
        const messageId = await supportRepository.insertTicketMessage(connection, {
            ticketId: id,
            senderId: customerId,
            senderRole: "CUSTOMER",
            message
        });
        return { messageId };
    });
    await notifyAdmins(
        id,
        result.messageId,
        "Customer replied to a support ticket",
        `A customer replied to support ticket #${id}.`
    );
    return { message_id: result.messageId };
}

export async function getAdminTickets(query = {}) {
    const filters = parseQuery(listQuerySchema, query);
    const params = {
        status: filters.status || null,
        category: filters.category || null,
        priority: filters.priority || null,
        search: filters.search || null,
        limit: filters.limit,
        offset: filters.offset
    };
    const [total, tickets] = await Promise.all([
        supportRepository.countTickets(params),
        supportRepository.listAdminTickets(params)
    ]);
    return {
        tickets,
        pagination: {
            page: filters.page,
            limit: filters.limit,
            total,
            total_pages: Math.ceil(total / filters.limit)
        }
    };
}

export async function getAdminTicket(ticketId, query = {}) {
    const id = parseId(ticketId, "ticket ID");
    const ticket = await supportRepository.getAdminTicket(id);
    if (!ticket) throw new ApiError(404, "Support ticket not found.");
    return { ticket, ...(await getTicketMessages(id, query)) };
}

export async function replyAsAdmin(adminId, ticketId, text) {
    const responderId = parseId(adminId, "admin ID");
    const id = parseId(ticketId, "ticket ID");
    const message = validateMessage(text);
    const result = await withTransaction(async (connection) => {
        const ticket = await supportRepository.lockTicket(connection, id);
        if (!ticket) throw new ApiError(404, "Support ticket not found.");
        if (ticket.status === "CLOSED") {
            throw new ApiError(409, "Closed tickets cannot receive responses.");
        }
        if (ticket.status !== "IN_PROGRESS") {
            await supportRepository.updateTicket(connection, id, {
                status: "IN_PROGRESS"
            });
        }
        if (ticket.assigned_admin_id == null) {
            await supportRepository.assignTicket(connection, id, responderId);
        }
        const messageId = await supportRepository.insertTicketMessage(connection, {
            ticketId: id,
            senderId: responderId,
            senderRole: "ADMIN",
            message
        });
        return { messageId, customerId: ticket.customer_id };
    });
    await sendNotificationBestEffort(customerNotification(
        result.customerId,
        id,
        `support-ticket:${id}:message:${result.messageId}`,
        "Support replied to your ticket",
        `There is a new response on support ticket #${id}.`
    ));
    return { message_id: result.messageId, status: "IN_PROGRESS" };
}

export async function updateAdminTicket(adminId, ticketId, input) {
    const actorId = parseId(adminId, "admin ID");
    const id = parseId(ticketId, "ticket ID");
    const { error, value } = updateSupportTicketSchema.validate(input, { abortEarly: false });
    if (error) throw new ApiError(400, error.details.map((item) => item.message).join(" "));

    const result = await withTransaction(async (connection) => {
        const ticket = await supportRepository.lockTicket(connection, id);
        if (!ticket) throw new ApiError(404, "Support ticket not found.");
        const changedStatus = value.status !== undefined && value.status !== ticket.status;
        await supportRepository.updateTicket(connection, id, value);
        return {
            customerId: ticket.customer_id,
            status: value.status ?? ticket.status,
            changedStatus
        };
    });
    if (result.changedStatus) {
        await sendNotificationBestEffort(customerNotification(
            result.customerId,
            id,
            `support-ticket:${id}:status:${result.status}:${randomUUID()}`,
            "Support ticket updated",
            `Support ticket #${id} is now ${result.status.replaceAll("_", " ").toLowerCase()}.`
        ));
    }
    return { ticket_id: id, ...value, updated_by: actorId };
}

export async function assignTicketToAdmin(adminId, ticketId) {
    const assigneeId = parseId(adminId, "admin ID");
    const id = parseId(ticketId, "ticket ID");
    await withTransaction(async (connection) => {
        const ticket = await supportRepository.lockTicket(connection, id);
        if (!ticket) throw new ApiError(404, "Support ticket not found.");
        await supportRepository.assignTicket(connection, id, assigneeId);
    });
    return { ticket_id: id, assigned_admin_id: assigneeId };
}
