import { query } from "../database/index.js";

const toSafeInt = (value, fallback, max = 100) => {
    const number = Number.parseInt(value, 10);

    if (!Number.isInteger(number) || number < 1) {
        return fallback;
    }

    return Math.min(number, max);
};

export const getDashboardStatistics = async () => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM orders) AS total_orders,

            (
                SELECT COALESCE(SUM(total), 0)
                FROM orders
                WHERE payment_status = 'PAID'
            ) AS total_revenue,

            (
                SELECT COUNT(*)
                FROM users u
                INNER JOIN roles r ON r.role_id = u.role_id
                WHERE LOWER(r.name) = 'customer'
            ) AS total_customers,

            (SELECT COUNT(*) FROM products) AS total_products,

            (
                SELECT COUNT(*) FROM orders WHERE status = 'PENDING'
            ) AS pending_orders,

            (
                SELECT COUNT(*) FROM orders WHERE status = 'DELIVERED'
            ) AS delivered_orders,

            (
                SELECT COUNT(*) FROM orders WHERE status = 'CANCELLED'
            ) AS cancelled_orders
    `;

    const rows = await query(sql);

    return rows[0];
};

export const getRecentOrders = async (limit = 5) => {
    const safeLimit = toSafeInt(limit, 5, 50);

    const sql = `
        SELECT
            o.order_id,
            o.order_number,
            o.user_id,
            o.subtotal,
            o.total,
            o.status,
            o.payment_status,
            o.created_at,
            u.first_name,
            u.last_name,
            u.email
        FROM orders o
        INNER JOIN users u ON u.user_id = o.user_id
        ORDER BY o.created_at DESC
        LIMIT ${safeLimit}
    `;

    return query(sql);
};

export const getMonthlyRevenue = async () => {
    const sql = `
        SELECT
            DATE_FORMAT(created_at, '%Y-%m') AS month_key,
            DATE_FORMAT(MIN(created_at), '%b') AS month,
            COALESCE(SUM(total), 0) AS revenue,
            COUNT(*) AS orders
        FROM orders
        WHERE
            payment_status = 'PAID'
            AND created_at >= DATE_SUB(
                DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'),
                INTERVAL 11 MONTH
            )
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY DATE_FORMAT(created_at, '%Y-%m') ASC
    `;

    return query(sql);
};

export const getOrderStatusStatistics = async () => {
    const sql = `
        SELECT
            status,
            COUNT(*) AS total
        FROM orders
        GROUP BY status
        ORDER BY total DESC
    `;

    return query(sql);
};

export const getLowStockVariants = async (threshold = 5) => {
    const safeThreshold = Number.isFinite(Number(threshold))
        ? Math.max(0, Math.floor(Number(threshold)))
        : 5;

    const sql = `
        SELECT
            pv.variant_id,
            pv.product_id,
            pv.sku,
            pv.stock,
            pv.status,
            p.name AS product_name
        FROM product_variants pv
        INNER JOIN products p ON p.product_id = pv.product_id
        WHERE
            pv.stock <= ${safeThreshold}
            AND pv.status = 'ACTIVE'
        ORDER BY pv.stock ASC
        LIMIT 10
    `;

    return query(sql);
};