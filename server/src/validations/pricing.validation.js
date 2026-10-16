import Joi from "joi";

export const updatePricingSettingsSchema = Joi.object({
    currency: Joi.string()
        .length(3)
        .uppercase(),

    shipping_fee: Joi.number()
        .min(0)
        .precision(2),

    free_shipping_threshold: Joi.number()
        .min(0)
        .precision(2)
        .allow(null),

    tax_rate: Joi.number()
        .min(0)
        .max(100)
        .precision(2),

    tax_enabled: Joi.number()
        .valid(0, 1)
})
.min(1);

export const previewPricingSchema = Joi.object({
    subtotal: Joi.number()
        .positive()
        .precision(2)
        .required(),

    discount: Joi.number()
        .min(0)
        .precision(2)
        .default(0)
});