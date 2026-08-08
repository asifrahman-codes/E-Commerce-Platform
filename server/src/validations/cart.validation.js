import Joi from "joi";


/*
|--------------------------------------------------------------------------
| Add Item To Cart
|--------------------------------------------------------------------------
*/

export const addCartItemSchema = Joi.object({

    variant_id: Joi.number()
        .integer()
        .positive()
        .required(),

    quantity: Joi.number()
        .integer()
        .positive()
        .required()

});


/*
|--------------------------------------------------------------------------
| Update Cart Item
|--------------------------------------------------------------------------
*/

export const updateCartItemSchema = Joi.object({

    quantity: Joi.number()
        .integer()
        .positive()
        .required()

});