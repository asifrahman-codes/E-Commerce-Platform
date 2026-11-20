import { pool, query } from "../database/index.js";

const toPositiveInt = (value, fallback, max = Number.MAX_SAFE_INTEGER) => {
    const number = Number.parseInt(value, 10);

    if (!Number.isInteger(number) || number < 1) {
        return fallback;
    }

    return Math.min(number, max);
};

export const findInventoryDashboard = async () => {
    const [summary] = await query(`
        SELECT
            COUNT(*) AS total_variants,
            COALESCE(SUM(stock), 0) AS total_stock,
            COALESCE(SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END), 0) AS out_of_stock
        FROM product_variants
        WHERE status = 'ACTIVE'
    `);

    const [transactions] = await query(`
        SELECT COUNT(*) AS total_transactions
        FROM inventory_transactions
        WHERE DATE(created_at) = CURDATE()
    `);

    return {
        total_variants: Number(summary.total_variants),
        total_stock: Number(summary.total_stock),
        out_of_stock: Number(summary.out_of_stock),
        transactions_today: Number(transactions.total_transactions)
    };
};

export const findLowStockVariants = async (threshold = 5) => {
    const safeThreshold = Number.isFinite(Number(threshold))
        ? Math.max(0, Math.floor(Number(threshold)))
        : 5;

    return query(`
        SELECT
            pv.variant_id,
            pv.product_id,
            p.name AS product_name,
            pv.sku,
            pv.size,
            pv.color,
            pv.stock,
            pv.status
        FROM product_variants pv
        INNER JOIN products p ON p.product_id = pv.product_id
        WHERE pv.stock <= ${safeThreshold}
        AND pv.status = 'ACTIVE'
        AND p.status = 'ACTIVE'
        ORDER BY pv.stock ASC, p.name ASC
    `);
};

export const findInventoryHistory = async ({
    page = 1,
    limit = 20,
    transaction_type = "",
    variant_id = null
}) => {
    const safeLimit = toPositiveInt(limit, 20, 100);
    const safePage = toPositiveInt(page, 1);
    const offset = (safePage - 1) * safeLimit;

    const conditions = [];
    const params = [];

    if (transaction_type) {
        conditions.push("it.transaction_type = ?");
        params.push(transaction_type);
    }

    if (variant_id) {
        conditions.push("it.variant_id = ?");
        params.push(variant_id);
    }

    const where = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const countRows = await query(
        `
        SELECT COUNT(*) AS total
        FROM inventory_transactions it
        ${where}
        `,
        params
    );

    const rows = await query(
        `
        SELECT
            it.transaction_id,
            it.variant_id,
            it.quantity_change,
            it.transaction_type,
            it.reference_id,
            it.notes,
            it.created_at,
            pv.sku,
            pv.size,
            pv.color,
            p.product_id,
            p.name AS product_name
        FROM inventory_transactions it
        INNER JOIN product_variants pv ON pv.variant_id = it.variant_id
        INNER JOIN products p ON p.product_id = pv.product_id
        ${where}
        ORDER BY it.created_at DESC, it.transaction_id DESC
        LIMIT ${safeLimit} OFFSET ${offset}
        `,
        params
    );

    const total = Number(countRows[0].total);

    return {
        items: rows,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit)
        }
    };
};

export const adjustVariantStock = async ({
    variant_id,
    quantity_change,
    transaction_type,
    reference_id = null,
    notes = null
}) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [variants] = await connection.execute(
            `
            SELECT variant_id, stock, status
            FROM product_variants
            WHERE variant_id = ?
            FOR UPDATE
            `,
            [variant_id]
        );

        const variant = variants[0];

        if (!variant) {
            const error = new Error("Product variant not found.");
            error.statusCode = 404;
            throw error;
        }

        if (variant.status !== "ACTIVE") {
            const error = new Error("Cannot adjust an inactive variant.");
            error.statusCode = 409;
            throw error;
        }

        const currentStock = Number(variant.stock);
        const nextStock = currentStock + quantity_change;

        if (!Number.isSafeInteger(nextStock) || nextStock < 0) {
            const error = new Error(
                "Insufficient stock. Stock cannot be negative."
            );
            error.statusCode = 409;
            throw error;
        }

        await connection.execute(
            `
            UPDATE product_variants
            SET stock = ?
            WHERE variant_id = ?
            `,
            [nextStock, variant_id]
        );

        await connection.execute(
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

        await connection.commit();

        return {
            variant_id,
            previous_stock: currentStock,
            quantity_change,
            current_stock: nextStock,
            transaction_type
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};