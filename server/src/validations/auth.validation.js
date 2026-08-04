import Joi from "joi";

export const registerSchema = Joi.object({

    firstName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.empty": "First name is required",
            "string.min": "First name must be at least 2 characters",
            "string.max": "First name cannot exceed 50 characters"
        }),

    lastName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.empty": "Last name is required",
            "string.min": "Last name must be at least 2 characters",
            "string.max": "Last name cannot exceed 50 characters"
        }),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Invalid email address"
        }),

    password: Joi.string()
  .min(8)
  .max(100)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
  .required()
  .messages({
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
  }),
  
    phone: Joi.string()
        .trim()
        .allow("")
        .optional()

});