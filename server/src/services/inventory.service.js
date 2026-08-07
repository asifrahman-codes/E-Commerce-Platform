import ApiError from "../utils/ApiError.js";

import {
    getVariantForUpdate,
    updateVariantStockWithTransaction,
    createInventoryTransactionWithTransaction,
    getVariantStock,
    getInventoryTransactions
} from "../repositories/inventory.repository.js";

import { pool } from "../database/index.js";

export const adjustInventoryService = async ({
    variantId,
    quantityChange,
    transactionType,
    referenceId = null,
    notes = null
}) => {

    /*
    |--------------------------------------------------------------------------
    | Validate Transaction Type
    |--------------------------------------------------------------------------
    */

    const allowedTypes = [
        "PURCHASE",
        "SALE",
        "RETURN",
        "ADJUSTMENT"
    ];

    if (!allowedTypes.includes(transactionType)) {

        throw new ApiError(
            400,
            "Invalid inventory transaction type"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Validate Quantity
    |--------------------------------------------------------------------------
    */

    if (
        !Number.isInteger(quantityChange) ||
        quantityChange === 0
    ) {

        throw new ApiError(
            400,
            "Quantity change must be a non-zero integer"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Get Database Connection
    |--------------------------------------------------------------------------
    */

    const connection = await pool.getConnection();


    try {

        /*
        |--------------------------------------------------------------------------
        | Begin Transaction
        |--------------------------------------------------------------------------
        */

        await connection.beginTransaction();


        /*
        |--------------------------------------------------------------------------
        | Get & Lock Variant
        |--------------------------------------------------------------------------
        */

        const variant =
            await getVariantForUpdate(
                connection,
                variantId
            );


        /*
        |--------------------------------------------------------------------------
        | Check Variant
        |--------------------------------------------------------------------------
        */

        if (!variant) {

            throw new ApiError(
                404,
                "Product variant not found"
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Check Variant Status
        |--------------------------------------------------------------------------
        */

        if (variant.status !== "ACTIVE") {

            throw new ApiError(
                400,
                "Cannot update inventory for an inactive variant"
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Calculate New Stock
        |--------------------------------------------------------------------------
        */

        const currentStock =
            Number(variant.stock);

        const newStock =
            currentStock + Number(quantityChange);


        /*
        |--------------------------------------------------------------------------
        | Prevent Negative Stock
        |--------------------------------------------------------------------------
        */

        if (newStock < 0) {

            throw new ApiError(
                400,
                "Insufficient stock"
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Update Stock
        |--------------------------------------------------------------------------
        */

        await updateVariantStockWithTransaction(
            connection,
            variantId,
            newStock
        );


        /*
        |--------------------------------------------------------------------------
        | Create Transaction Record
        |--------------------------------------------------------------------------
        */

        const transactionId =
            await createInventoryTransactionWithTransaction(
                connection,
                {
                    variant_id: variantId,
                    quantity_change: quantityChange,
                    transaction_type: transactionType,
                    reference_id: referenceId,
                    notes
                }
            );


        /*
        |--------------------------------------------------------------------------
        | Commit Transaction
        |--------------------------------------------------------------------------
        */

        await connection.commit();


        /*
        |--------------------------------------------------------------------------
        | Return Result
        |--------------------------------------------------------------------------
        */

        return {

            transaction_id:
                transactionId,

            variant_id:
                variantId,

            previous_stock:
                currentStock,

            quantity_change:
                quantityChange,

            new_stock:
                newStock,

            transaction_type:
                transactionType,

            reference_id:
                referenceId,

            notes

        };

    } catch (error) {

        /*
        |--------------------------------------------------------------------------
        | Rollback
        |--------------------------------------------------------------------------
        */

        await connection.rollback();

        throw error;

    } finally {

        /*
        |--------------------------------------------------------------------------
        | Release Connection
        |--------------------------------------------------------------------------
        */

        connection.release();

    }

};

/*
|--------------------------------------------------------------------------
| Get Inventory History
|--------------------------------------------------------------------------
*/

export const getInventoryHistoryService = async (
    variantId
) => {

    const variant = await getVariantStock(variantId);

    if (!variant) {

        throw new ApiError(
            404,
            "Product variant not found"
        );

    }


    const transactions =
        await getInventoryTransactions(variantId);


    return {

        variant_id:
            variant.variant_id,

        current_stock:
            variant.stock,

        transactions

    };

};