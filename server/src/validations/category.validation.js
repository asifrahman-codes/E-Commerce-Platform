import Joi from "joi";

/*
|--------------------------------------------------------------------------
| Create Category
|--------------------------------------------------------------------------
*/

export const createCategorySchema = Joi.object({

    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    description: Joi.string()
        .trim()
        .max(500)
        .allow("")
        .optional(),

    status: Joi.string()
        .valid(
            "ACTIVE",
            "INACTIVE"
        )
        .default("ACTIVE")

});

/*
|--------------------------------------------------------------------------
| Update Category
|--------------------------------------------------------------------------
*/

export const updateCategorySchema = Joi.object({

    name: Joi.string()
        .trim()
        .min(2)
        .max(100),

    description: Joi.string()
        .trim()
        .max(500)
        .allow(""),

    status: Joi.string()
        .valid(
            "ACTIVE",
            "INACTIVE"
        )

}).min(1);