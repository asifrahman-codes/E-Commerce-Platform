
import Joi from "joi";

export const createPaymentSchema = Joi.object({
    method: Joi.string()
        .valid("COD")
        .required()
});
