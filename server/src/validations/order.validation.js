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
        .optional()

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