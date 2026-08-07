import Joi from "joi";


/*
|--------------------------------------------------------------------------
| Adjust Inventory Validation
|--------------------------------------------------------------------------
*/

export const adjustInventorySchema = Joi.object({

    variant_id: Joi.number()
        .integer()
        .positive()
        .required(),

    quantity_change: Joi.number()
        .integer()
        .not(0)
        .required(),

    transaction_type: Joi.string()
        .valid(
            "PURCHASE",
            "SALE",
            "RETURN",
            "ADJUSTMENT"
        )
        .required(),

    reference_id: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .optional(),

    notes: Joi.string()
        .trim()
        .max(255)
        .allow("")
        .allow(null)
        .optional()

});