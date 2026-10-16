import Joi from "joi";

export const createCouponSchema = Joi.object({
    code: Joi.string()
        .trim()
        .uppercase()
        .min(3)
        .max(50)
        .pattern(/^[A-Z0-9_-]+$/)
        .required(),

    description: Joi.string()
        .trim()
        .max(255)
        .allow("", null)
        .optional(),

    discount_type: Joi.string()
        .valid("PERCENTAGE", "FIXED")
        .required(),

    discount_value: Joi.number()
        .positive()
        .precision(2)
        .required(),

    min_order_amount: Joi.number()
        .min(0)
        .precision(2)
        .default(0),

    max_discount_amount: Joi.number()
        .positive()
        .precision(2)
        .allow(null)
        .optional(),

    usage_limit: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .optional(),

    per_user_limit: Joi.number()
        .integer()
        .positive()
        .default(1),

    starts_at: Joi.date().iso().required(),
    expires_at: Joi.date().iso().greater(Joi.ref("starts_at")).required(),

    status: Joi.string()
        .valid("ACTIVE", "INACTIVE")
        .default("ACTIVE")
}).custom((value, helpers) => {
    if (
        value.discount_type === "PERCENTAGE" &&
        value.discount_value > 100
    ) {
        return helpers.error("any.invalid");
    }

    return value;
}).messages({
    "any.invalid": "Percentage discount cannot exceed 100."
});

export const updateCouponSchema = Joi.object({
    description: Joi.string().trim().max(255).allow("", null),
    discount_type: Joi.string().valid("PERCENTAGE", "FIXED"),
    discount_value: Joi.number().positive().precision(2),
    min_order_amount: Joi.number().min(0).precision(2),
    max_discount_amount: Joi.number().positive().precision(2).allow(null),
    usage_limit: Joi.number().integer().positive().allow(null),
    per_user_limit: Joi.number().integer().positive(),
    starts_at: Joi.date().iso(),
    expires_at: Joi.date().iso(),
    status: Joi.string().valid("ACTIVE", "INACTIVE")
})
.min(1)
.custom((value, helpers) => {
    if (
        value.discount_type === "PERCENTAGE" &&
        value.discount_value !== undefined &&
        value.discount_value > 100
    ) {
        return helpers.error("any.invalid");
    }

    if (
        value.starts_at !== undefined &&
        value.expires_at !== undefined &&
        new Date(value.expires_at) <= new Date(value.starts_at)
    ) {
        return helpers.error("any.invalid");
    }

    return value;
})
.messages({
    "any.invalid": "Invalid percentage discount or coupon date range."
});

export const validateCouponSchema = Joi.object({
    code: Joi.string()
        .trim()
        .uppercase()
        .min(3)
        .max(50)
        .pattern(/^[A-Z0-9_-]+$/)
        .required(),

    subtotal: Joi.number()
        .positive()
        .precision(2)
        .required()
});