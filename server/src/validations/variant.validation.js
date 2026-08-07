import Joi from "joi";

/*
|--------------------------------------------------------------------------
| Create Product Variant
|--------------------------------------------------------------------------
*/

export const createVariantSchema = Joi.object({

    sku: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    size: Joi.string()
        .trim()
        .max(50)
        .allow("")
        .optional(),

    color: Joi.string()
        .trim()
        .max(50)
        .allow("")
        .optional(),

    price_adjustment: Joi.number()
        .precision(2)
        .default(0),

    stock: Joi.number()
        .integer()
        .min(0)
        .default(0),

    status: Joi.string()
        .valid("ACTIVE", "INACTIVE")
        .default("ACTIVE")
});


/*
|--------------------------------------------------------------------------
| Update Product Variant
|--------------------------------------------------------------------------
*/

export const updateVariantSchema = Joi.object({

    sku: Joi.string()
        .trim()
        .min(2)
        .max(100),

    size: Joi.string()
        .trim()
        .max(50)
        .allow(""),

    color: Joi.string()
        .trim()
        .max(50)
        .allow(""),

    price_adjustment: Joi.number()
        .precision(2),

    stock: Joi.number()
        .integer()
        .min(0),

    status: Joi.string()
        .valid("ACTIVE", "INACTIVE")

}).min(1);