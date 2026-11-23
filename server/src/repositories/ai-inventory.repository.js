
import { query } from "../database/index.js";

// Low-stock variants
export async function getLowStockVariants(threshold = 5) {
    const sql = `
        SELECT
            pv.variant_id,
            pv.product_id,
            pv.stock,
            pv.status,
            p.name AS product_name
        FROM product_variants pv
        INNER JOIN products p
            ON p.product_id = pv.product_id
        WHERE pv.status = 'ACTIVE'
          AND pv.stock <= ?
        ORDER BY pv.stock ASC
        LIMIT 100
    `;

    return query(sql, [threshold]);
}

// Products with the highest sales
export async function getFastMovingProducts(days = 30) {
    const sql = `
        SELECT
            oi.variant_id,
            oi.product_name,
            SUM(oi.quantity) AS units_sold,
            SUM(oi.total_price) AS total_sales
        FROM order_items oi
        INNER JOIN orders o
            ON o.order_id = oi.order_id
        WHERE o.created_at >= DATE_SUB(
            CURDATE(),
            INTERVAL ? DAY
        )
        AND o.status NOT IN ('CANCELLED', 'REFUNDED')
        GROUP BY
            oi.variant_id,
            oi.product_name
        ORDER BY units_sold DESC
        LIMIT 20
    `;

    return query(sql, [days]);
}

// Products with the lowest sales
export async function getSlowMovingProducts(days = 30) {
    const sql = `
        SELECT
            pv.variant_id,
            pv.product_id,
            pv.stock,
            p.name AS product_name,
            COALESCE(SUM(
                CASE
                    WHEN o.order_id IS NOT NULL
                    THEN oi.quantity
                    ELSE 0
                END
            ), 0) AS units_sold
        FROM product_variants pv
        INNER JOIN products p
            ON p.product_id = pv.product_id
        LEFT JOIN order_items oi
            ON oi.variant_id = pv.variant_id
        LEFT JOIN orders o
            ON o.order_id = oi.order_id
            AND o.status NOT IN ('CANCELLED', 'REFUNDED')
            AND o.created_at >= DATE_SUB(
                CURDATE(),
                INTERVAL ? DAY
            )
        WHERE pv.status = 'ACTIVE'
        GROUP BY
            pv.variant_id,
            pv.product_id,
            pv.stock,
            p.name
        ORDER BY units_sold ASC
        LIMIT 20
    `;

    return query(sql, [days]);
}

// Overall stock statistics
export async function getInventoryStatistics() {
    const sql = `
        SELECT
            COUNT(*) AS total_variants,
            COALESCE(SUM(stock), 0) AS total_stock,

            SUM(
                CASE WHEN stock = 0
                THEN 1 ELSE 0 END
            ) AS out_of_stock,

            SUM(
                CASE WHEN stock > 0 AND stock <= 5
                THEN 1 ELSE 0 END
            ) AS low_stock,

            SUM(
                CASE WHEN stock > 5
                THEN 1 ELSE 0 END
            ) AS healthy_stock

        FROM product_variants
        WHERE status = 'ACTIVE'
    `;

    const rows = await query(sql);

    return rows[0];
}
