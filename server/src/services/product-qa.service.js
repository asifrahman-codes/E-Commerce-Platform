import { createHash } from "node:crypto";
import Joi from "joi";
import { pool } from "../database/index.js";
import * as productQaRepository from "../repositories/product-qa.repository.js";
import withTransaction from "../utils/transaction.js";
import ApiError from "../utils/ApiError.js";
import { createNotification } from "./notification.service.js";
import {
    answerProductQuestionSchema,
    createProductQuestionSchema
} from "../validations/product-qa.validation.js";

const questionStatuses = ["PENDING", "APPROVED", "REJECTED", "HIDDEN"];
const pageSchema = Joi.object({
    page: Joi.number().integer().min(1).max(Number.MAX_SAFE_INTEGER).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10)
});
const adminQuerySchema = pageSchema.append({
    status: Joi.string().valid(...questionStatuses).allow(""),
    search: Joi.string().trim().max(100).allow("")
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
    if (!Number.isSafeInteger(offset)) {
        throw new ApiError(400, "Page is too large.");
    }
    return { ...value, offset };
}

function normalizeQuestion(question) {
    return question.trim().replace(/\s+/g, " ");
}

function containsContactInformation(text) {
    const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
    const phone = /(?:\+?\d[\s().-]*){8,}/;
    return email.test(text) || phone.test(text);
}

async function notifyAnswerApproved({ userId, productId, questionId, answerId }) {
    try {
        await createNotification({
            userId,
            eventKey: `product-question:${questionId}:answer:${answerId}:approved`,
            type: "PRODUCT_QUESTION_ANSWERED",
            title: "Your product question was answered",
            message: "An answer to your product question is now public.",
            data: { product_id: productId, question_id: questionId },
            sendEmail: true
        });
    } catch (error) {
        console.error("Product Q&A notification failed:", error.message);
    }
}

export async function createProductQuestion(userId, productId, text) {
    const customerId = parseId(userId, "user ID");
    const id = parseId(productId, "product ID");
    const { error, value } = createProductQuestionSchema.validate({ question: text });
    if (error) throw new ApiError(400, "Question must be between 5 and 2000 characters.");
    const question = value.question;
    if (containsContactInformation(question)) {
        throw new ApiError(400, "For your privacy, do not include email addresses or phone numbers.");
    }

    const normalized = normalizeQuestion(question);
    const questionHash = createHash("sha256")
        .update(normalized.toLocaleLowerCase("en-US"))
        .digest("hex");
    try {
        const questionId = await withTransaction(async (connection) => {
            const submitter = await productQaRepository.lockQuestionSubmitter(
                connection,
                customerId
            );
            if (!submitter) throw new ApiError(404, "Customer not found.");
            if (!await productQaRepository.findActiveProduct(connection, id)) {
                throw new ApiError(404, "Active product not found.");
            }
            if (await productQaRepository.countRecentQuestions(connection, customerId) >= 5) {
                throw new ApiError(429, "You have reached the daily product-question limit.");
            }
            return productQaRepository.insertQuestion(connection, {
                productId: id,
                userId: customerId,
                question,
                questionHash
            });
        });
        return { question_id: questionId, status: "PENDING" };
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            throw new ApiError(409, "You have already submitted this question for the product.");
        }
        throw error;
    }
}

export async function getProductQuestions(productId, query = {}) {
    const id = parseId(productId, "product ID");
    if (!await productQaRepository.findActiveProduct(pool, id)) {
        throw new ApiError(404, "Active product not found.");
    }
    const pagination = parseQuery(pageSchema, query);
    const [total, questions] = await Promise.all([
        productQaRepository.countApprovedQuestions(id),
        productQaRepository.listApprovedQuestions(id, pagination)
    ]);
    return {
        product_id: id,
        questions,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            total_pages: Math.ceil(total / pagination.limit)
        }
    };
}

export async function getAdminProductQuestions(query = {}) {
    const filters = parseQuery(adminQuerySchema, query);
    const status = filters.status || null;
    const search = filters.search || null;
    const params = { status, search, limit: filters.limit, offset: filters.offset };
    const [total, questions] = await Promise.all([
        productQaRepository.countAdminQuestions(params),
        productQaRepository.listAdminQuestions(params)
    ]);
    return {
        questions,
        pagination: {
            page: filters.page,
            limit: filters.limit,
            total,
            total_pages: Math.ceil(total / filters.limit)
        }
    };
}

export async function moderateProductQuestion(adminId, questionId, input) {
    const moderatorId = parseId(adminId, "admin ID");
    const id = parseId(questionId, "question ID");
    const status = String(input.status).toUpperCase();
    if (!questionStatuses.slice(1).includes(status)) {
        throw new ApiError(400, "Invalid question moderation status.");
    }
    const result = await withTransaction(async (connection) => {
        const question = await productQaRepository.findQuestionForUpdate(connection, id);
        if (!question) throw new ApiError(404, "Product question not found.");
        await productQaRepository.moderateQuestion(connection, id, {
            status,
            adminId: moderatorId,
            reason: input.reason?.trim() || null
        });
        const answer = status === "APPROVED"
            ? await productQaRepository.findAnswerForQuestion(connection, id)
            : null;
        return {
            questionId: id,
            userId: question.user_id,
            productId: question.product_id,
            answerId: answer?.status === "APPROVED" ? answer.answer_id : null
        };
    });
    if (result.answerId) {
        await notifyAnswerApproved({
            userId: result.userId,
            productId: result.productId,
            questionId: id,
            answerId: result.answerId
        });
    }
    return { question_id: id, status };
}

export async function answerProductQuestion(adminId, questionId, text) {
    const moderatorId = parseId(adminId, "admin ID");
    const id = parseId(questionId, "question ID");
    const { error, value } = answerProductQuestionSchema.validate({ answer: text });
    if (error) throw new ApiError(400, "Answer must be between 2 and 5000 characters.");
    const answer = value.answer;
    return withTransaction(async (connection) => {
        const question = await productQaRepository.findQuestionForUpdate(connection, id);
        if (!question) throw new ApiError(404, "Product question not found.");
        if (["REJECTED", "HIDDEN"].includes(question.status)) {
            throw new ApiError(409, "This question cannot be answered in its current state.");
        }
        await productQaRepository.upsertAnswer(connection, {
            questionId: id,
            adminId: moderatorId,
            answer
        });
        const savedAnswer = await productQaRepository.findAnswerForQuestion(connection, id);
        return { answer_id: savedAnswer.answer_id, status: "PENDING" };
    });
}

export async function moderateProductAnswer(adminId, answerId, input) {
    const moderatorId = parseId(adminId, "admin ID");
    const id = parseId(answerId, "answer ID");
    const status = String(input.status).toUpperCase();
    if (!questionStatuses.slice(1).includes(status)) {
        throw new ApiError(400, "Invalid answer moderation status.");
    }
    const result = await withTransaction(async (connection) => {
        const answer = await productQaRepository.findAnswerForUpdate(connection, id);
        if (!answer) throw new ApiError(404, "Product answer not found.");
        await productQaRepository.moderateAnswer(connection, id, {
            status,
            adminId: moderatorId,
            reason: input.reason?.trim() || null
        });
        return {
            questionId: answer.question_id,
            userId: answer.user_id,
            productId: answer.product_id,
            shouldNotify: status === "APPROVED" && answer.question_status === "APPROVED"
        };
    });
    if (result.shouldNotify) {
        await notifyAnswerApproved({
            userId: result.userId,
            productId: result.productId,
            questionId: result.questionId,
            answerId: id
        });
    }
    return { answer_id: id, status };
}

export async function markAnswerUseful(userId, answerId, useful) {
    const customerId = parseId(userId, "user ID");
    const id = parseId(answerId, "answer ID");
    const approvedAnswer = await productQaRepository.findApprovedAnswer(pool, id);
    if (!approvedAnswer) throw new ApiError(404, "Approved product answer not found.");
    const markedUseful = useful
        ? await productQaRepository.insertUsefulVote(pool, id, customerId)
        : await productQaRepository.deleteUsefulVote(pool, id, customerId);
    return {
        is_useful: useful ? true : false,
        changed: markedUseful,
        useful_count: await productQaRepository.countUsefulVotes(id)
    };
}
