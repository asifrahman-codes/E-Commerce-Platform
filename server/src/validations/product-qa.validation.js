import Joi from "joi";

const questionText = Joi.string().trim().min(5).max(2000);
const answerText = Joi.string().trim().min(2).max(5000);
const moderation = Joi.object({
    status: Joi.string().valid("APPROVED", "REJECTED", "HIDDEN").required(),
    reason: Joi.string().trim().allow("").max(500).default("")
});

export const createProductQuestionSchema = Joi.object({
    question: questionText.required()
});

export const answerProductQuestionSchema = Joi.object({
    answer: answerText.required()
});

export const moderateProductQuestionSchema = moderation;
export const moderateProductAnswerSchema = moderation;
