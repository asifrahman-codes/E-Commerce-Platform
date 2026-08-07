import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    adjustInventoryService,
    getInventoryHistoryService
} from "../services/inventory.service.js";


/*
|--------------------------------------------------------------------------
| Adjust Inventory
|--------------------------------------------------------------------------
*/

export const adjustInventory = asyncHandler(async (req, res) => {

    const {
        variant_id,
        quantity_change,
        transaction_type,
        reference_id,
        notes
    } = req.body;


    const result = await adjustInventoryService({

        variantId: variant_id,

        quantityChange: quantity_change,

        transactionType: transaction_type,

        referenceId: reference_id,

        notes

    });


    return res.status(200).json(
        new ApiResponse(
            200,
            "Inventory updated successfully",
            result
        )
    );

});


/*
|--------------------------------------------------------------------------
| Get Inventory History
|--------------------------------------------------------------------------
*/

export const getInventoryHistory = asyncHandler(
    async (req, res) => {

        const result =
            await getInventoryHistoryService(
                req.params.variantId
            );


        return res.status(200).json(
            new ApiResponse(
                200,
                "Inventory history fetched successfully",
                result
            )
        );

    }
);