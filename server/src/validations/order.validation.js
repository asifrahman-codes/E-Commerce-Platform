import Joi from "joi";


/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/

export const createOrderSchema = Joi.object({

    address_id: Joi.number()
        .integer()
        .positive()
        .required(),

    coupon_code: Joi.string()
        .trim()
        .max(50)
        .allow("")
        .optional(),

    loyalty_points: Joi.number()
        .integer()
        .min(0)
        .max(Number.MAX_SAFE_INTEGER)
        .default(0)

});


/*
|--------------------------------------------------------------------------
| Cancel Order
|--------------------------------------------------------------------------
*/

export const cancelOrderSchema = Joi.object({

    reason: Joi.string()
        .trim()
        .max(255)
        .allow("")
        .optional()

});

export const previewOrderSchema = Joi.object({
    coupon_code: Joi.string()
        .trim()
        .max(50)
        .allow("")
        .optional(),
    loyalty_points: Joi.number()
        .integer()
        .min(0)
        .max(Number.MAX_SAFE_INTEGER)
        .default(0)
});
