import Joi from "joi";

export const updateProfileSchema = Joi.object({
    first_name: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
        .messages({
            "any.required": "First name is required",
            "string.empty": "First name is required",
        }),

    last_name: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
        .messages({
            "any.required": "Last name is required",
            "string.empty": "Last name is required",
        }),

    phone: Joi.string()
        .trim()
        .max(20)
        .allow("", null)
        .optional(),
});

export const changePasswordSchema = Joi.object({
    current_password: Joi.string()
        .required()
        .messages({
            "any.required": "Current password is required",
            "string.empty": "Current password is required",
        }),

    new_password: Joi.string()
        .min(8)
        .max(128)
        .required()
        .messages({
            "any.required": "New password is required",
            "string.min": "New password must be at least 8 characters",
        }),

    confirm_password: Joi.string()
        .valid(Joi.ref("new_password"))
        .required()
        .messages({
            "any.required": "Password confirmation is required",
            "any.only": "Passwords do not match",
        }),
});

export const deactivateAccountSchema = Joi.object({
    password: Joi.string()
        .required()
        .messages({
            "any.required": "Password is required to deactivate your account",
            "string.empty": "Password is required to deactivate your account",
        }),
});
