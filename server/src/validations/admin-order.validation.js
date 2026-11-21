import Joi from "joi";

const allowedOrderStatuses = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED"
];

const allowedPaymentStatuses = [
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED"
];

export const adminOrdersQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),

    search: Joi.string()
        .trim()
        .max(100)
        .allow("")
        .optional(),

    status: Joi.string()
        .valid(...allowedOrderStatuses)
        .allow("")
        .optional(),

    payment_status: Joi.string()
        .valid(...allowedPaymentStatuses)
        .allow("")
        .optional(),

    payment_method: Joi.string()
        .trim()
        .max(50)
        .allow("")
        .optional(),

    start_date: Joi.date()
        .iso()
        .allow("")
        .optional(),

    end_date: Joi.date()
        .iso()
        .allow("")
        .optional()
});

export const updateOrderStatusSchema = Joi.object({
    status: Joi.string()
        .valid(...allowedOrderStatuses)
        .required()
        .messages({
            "any.required": "Order status is required",
            "any.only": "Invalid order status value"
        }),

    notes: Joi.string()
        .trim()
        .max(255)
        .allow("", null)
        .optional()
});

export const updatePaymentStatusSchema = Joi.object({
    payment_status: Joi.string()
        .valid(...allowedPaymentStatuses)
        .required()
        .messages({
            "any.required": "Payment status is required",
            "any.only": "Invalid payment status value"
        }),

    notes: Joi.string()
        .trim()
        .max(255)
        .allow("", null)
        .optional()
});

export const cancelAdminOrderSchema = Joi.object({
    reason: Joi.string()
        .trim()
        .min(3)
        .max(255)
        .required()
        .messages({
            "any.required": "Cancellation reason is required",
            "string.min": "Cancellation reason must be at least 3 characters"
        }),

    notes: Joi.string()
        .trim()
        .max(255)
        .allow("", null)
        .optional(),

    restock: Joi.boolean()
        .default(true)
        .optional()
});
