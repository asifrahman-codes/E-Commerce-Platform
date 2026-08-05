import Joi from "joi";

export const refreshTokenSchema = Joi.object({

    refreshToken: Joi.string()
        .required()
        .messages({

            "any.required": "Refresh token is required",

            "string.empty": "Refresh token is required"

        })

});

export const logoutSchema = Joi.object({

    refreshToken: Joi.string()
        .required()

});