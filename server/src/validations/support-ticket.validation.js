import Joi from "joi";

const categories = [
    "ORDER", "PAYMENT", "SHIPPING", "RETURNS", "PRODUCT", "ACCOUNT", "OTHER"
];
const priorities = ["LOW", "NORMAL", "HIGH", "URGENT"];
const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export const createSupportTicketSchema = Joi.object({
    subject: Joi.string().trim().min(3).max(180).required(),
    category: Joi.string().valid(...categories).required(),
    priority: Joi.string().valid("LOW", "NORMAL", "HIGH").default("NORMAL"),
    message: Joi.string().trim().min(2).max(5000).required()
});

export const supportMessageSchema = Joi.object({
    message: Joi.string().trim().min(2).max(5000).required()
});

export const updateSupportTicketSchema = Joi.object({
    status: Joi.string().valid(...statuses),
    priority: Joi.string().valid(...priorities)
}).min(1);
