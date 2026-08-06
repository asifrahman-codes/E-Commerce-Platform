import Joi from "joi";

/*
|--------------------------------------------------------------------------
| Create Brand
|--------------------------------------------------------------------------
*/

export const createBrandSchema = Joi.object({

    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    logo: Joi.string()
        .trim()
        .uri()
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
| Update Brand
|--------------------------------------------------------------------------
*/

export const updateBrandSchema = Joi.object({

    name: Joi.string()
        .trim()
        .min(2)
        .max(100),

    logo: Joi.string()
        .trim()
        .uri()
        .allow(""),

    status: Joi.string()
        .valid(
            "ACTIVE",
            "INACTIVE"
        )

}).min(1);