import Joi from "joi";

const text = (max) =>
    Joi.string().trim().min(2).max(max);

export const createAddressSchema = Joi.object({
    country: text(100).required(),
    city: text(100).required(),
    street: text(255).required(),
    postal_code: Joi.string().trim().max(20).allow("", null).optional(),
    is_default: Joi.boolean().optional()
});

export const updateAddressSchema = Joi.object({
    country: text(100),
    city: text(100),
    street: text(255),
    postal_code: Joi.string().trim().max(20).allow("", null),
    is_default: Joi.boolean()
}).min(1);
