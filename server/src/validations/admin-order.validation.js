import Joi from "joi";

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
        .valid(
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED"
        )
        .allow("")
        .optional(),

    payment_status: Joi.string()
        .valid(
            "PENDING",
            "PAID",
            "FAILED",
            "REFUNDED"
        )
        .allow("")
        .optional()

});