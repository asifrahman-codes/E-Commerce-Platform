import Joi from "joi";

/*
|--------------------------------------------------------------------------
| Create Product
|--------------------------------------------------------------------------
*/

export const createProductSchema = Joi.object({

    category_id: Joi.number()
        .integer()
        .positive()
        .required(),

    brand_id: Joi.number()
        .integer()
        .positive()
        .required(),

    name: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .required(),

    description: Joi.string()
        .trim()
        .allow("")
        .optional(),

    base_price: Joi.number()
        .positive()
        .precision(2)
        .required(),

    status: Joi.string()
        .valid(
            "ACTIVE",
            "INACTIVE"
        )
        .default("ACTIVE")

});

/*
|--------------------------------------------------------------------------
| Update Product
|--------------------------------------------------------------------------
*/

export const updateProductSchema = Joi.object({

    category_id: Joi.number()
        .integer()
        .positive(),

    brand_id: Joi.number()
        .integer()
        .positive(),

    name: Joi.string()
        .trim()
        .min(2)
        .max(255),

    description: Joi.string()
        .trim()
        .allow(""),

    base_price: Joi.number()
        .positive()
        .precision(2),

    status: Joi.string()
        .valid(
            "ACTIVE",
            "INACTIVE"
        )

}).min(1);