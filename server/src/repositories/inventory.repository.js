import { query } from "../database/index.js";

export const getVariantStock = async (variantId) => {

    const sql = `
        SELECT
            variant_id,
            stock
        FROM product_variants
        WHERE variant_id = ?
        LIMIT 1
    `;

    const rows = await query(sql, [variantId]);

    return rows[0] || null;
};

/*
|--------------------------------------------------------------------------
| Get Variant For Update
|--------------------------------------------------------------------------
*/

export const getVariantForUpdate = async (
    connection,
    variantId
) => {

    const [rows] = await connection.execute(
        `
            SELECT
                variant_id,
                stock,
                status
            FROM product_variants
            WHERE variant_id = ?
            FOR UPDATE
        `,
        [variantId]
    );

    return rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Update Variant Stock With Transaction
|--------------------------------------------------------------------------
*/

export const updateVariantStockWithTransaction = async (
    connection,
    variantId,
    newStock
) => {

    if (newStock < 0) {
        throw new Error(
            "Stock cannot be negative"
        );
    }

    const [result] = await connection.execute(
        `
            UPDATE product_variants
            SET stock = ?
            WHERE variant_id = ?
        `,
        [
            newStock,
            variantId
        ]
    );

    return result.affectedRows;
};


/*
|--------------------------------------------------------------------------
| Create Inventory Transaction With Transaction
|--------------------------------------------------------------------------
*/

export const createInventoryTransactionWithTransaction = async (
    connection,
    {
        variant_id,
        quantity_change,
        transaction_type,
        reference_id = null,
        notes = null
    }
) => {

    const [result] = await connection.execute(
        `
            INSERT INTO inventory_transactions (
                variant_id,
                quantity_change,
                transaction_type,
                reference_id,
                notes
            )
            VALUES (?, ?, ?, ?, ?)
        `,
        [
            variant_id,
            quantity_change,
            transaction_type,
            reference_id,
            notes
        ]
    );

    return result.insertId;
};

export const getInventoryTransactions = async (variantId) => {

    const sql = `
        SELECT
            transaction_id,
            variant_id,
            quantity_change,
            transaction_type,
            reference_id,
            notes,
            created_at
        FROM inventory_transactions
        WHERE variant_id = ?
        ORDER BY created_at DESC, transaction_id DESC
    `;

    return await query(sql, [variantId]);
};

/*
|--------------------------------------------------------------------------
| Restore Variant Stock With Transaction
|--------------------------------------------------------------------------
*/

export const restoreVariantStockWithTransaction = async (
    connection,
    variantId,
    quantity
) => {

    const [result] =
        await connection.execute(
            `
                UPDATE product_variants
                SET stock = stock + ?
                WHERE variant_id = ?
            `,
            [
                quantity,
                variantId
            ]
        );

    return result.affectedRows;
};