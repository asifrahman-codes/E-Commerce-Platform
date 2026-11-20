import { query } from "../database/index.js";

/**
 * Main dashboard statistics
 */
export const getDashboardOverview = async () => {

    const sql = `
        SELECT

            (SELECT COUNT(*)
             FROM orders) AS total_orders,

            (SELECT COUNT(*)
             FROM orders
             WHERE DATE(created_at) = CURDATE()
            ) AS today_orders,

            (SELECT COUNT(*)
             FROM orders
             WHERE status = 'PENDING'
            ) AS pending_orders,

            (SELECT COUNT(*)
             FROM orders
             WHERE status = 'DELIVERED'
            ) AS delivered_orders,

            (SELECT COALESCE(SUM(total), 0)
             FROM orders
             WHERE payment_status = 'PAID'
            ) AS total_revenue,

            (SELECT COALESCE(SUM(total), 0)
             FROM orders
             WHERE payment_status = 'PAID'
             AND DATE(created_at) = CURDATE()
            ) AS today_revenue,

            (SELECT COALESCE(SUM(total), 0)
             FROM orders
             WHERE payment_status = 'PAID'
             AND YEAR(created_at) = YEAR(CURDATE())
             AND MONTH(created_at) = MONTH(CURDATE())
            ) AS monthly_revenue,

            (SELECT COUNT(*)
             FROM users u
             INNER JOIN roles r ON r.role_id = u.role_id
             WHERE LOWER(r.name) = 'customer'
            ) AS total_customers,

            (SELECT COUNT(*)
             FROM users u
             INNER JOIN roles r ON r.role_id = u.role_id
             WHERE LOWER(r.name) = 'customer'
             AND DATE(u.created_at) = CURDATE()
            ) AS today_customers,

            (SELECT COUNT(*)
             FROM products
            ) AS total_products,

            (SELECT COUNT(*)
             FROM products
             WHERE status = 'ACTIVE'
            ) AS active_products,

            (SELECT COUNT(*)
             FROM product_variants
             WHERE status = 'ACTIVE'
             AND stock <= 5
            ) AS low_stock_variants

    `;

    const rows = await query(sql);

    return rows[0];

};


/**
 * Revenue by day
 */
export const getSalesAnalytics = async (days = 7) => {

    const sql = `
        SELECT

            DATE(created_at) AS sale_date,

            COUNT(*) AS total_orders,

            COALESCE(SUM(total), 0) AS order_value,

            COALESCE(
                SUM(
                    CASE
                        WHEN payment_status = 'PAID'
                        THEN total
                        ELSE 0
                    END
                ),
                0
            ) AS revenue

        FROM orders

        WHERE created_at >= DATE_SUB(
            CURDATE(),
            INTERVAL ? DAY
        )

        GROUP BY DATE(created_at)

        ORDER BY sale_date ASC
    `;

    return await query(sql, [days]);

};


/**
 * Order status distribution
 */
export const getOrderStatusAnalytics = async () => {

    const sql = `
        SELECT

            status,

            COUNT(*) AS total

        FROM orders

        GROUP BY status

        ORDER BY total DESC
    `;

    return await query(sql);

};


/**
 * Top selling products
 */
export const getTopSellingProducts = async (limit = 5) => {

    const sql = `
        SELECT

            oi.product_name,

            oi.variant_id,

            SUM(oi.quantity) AS total_sold,

            SUM(oi.total_price) AS total_sales

        FROM order_items oi

        INNER JOIN orders o
            ON o.order_id = oi.order_id

        WHERE o.status <> 'CANCELLED'

        GROUP BY
            oi.variant_id,
            oi.product_name

        ORDER BY total_sold DESC

        LIMIT ?
    `;

    return await query(sql, [limit]);

};


/**
 * Recent orders
 */
export const getRecentOrders = async (limit = 10) => {

    const sql = `
        SELECT

            o.order_id,
            o.order_number,
            o.user_id,
            o.subtotal,
            o.discount,
            o.shipping,
            o.tax,
            o.total,
            o.status,
            o.payment_status,
            o.created_at,

            u.first_name,
            u.last_name,
            u.email

        FROM orders o

        INNER JOIN users u
            ON u.user_id = o.user_id

        ORDER BY o.created_at DESC

        LIMIT ?
    `;

    return await query(sql, [limit]);

};


/**
 * Customer analytics
 */
export const getCustomerAnalytics = async () => {

    const sql = `
        SELECT

            COUNT(DISTINCT u.user_id) AS total_customers,

            COUNT(
                DISTINCT CASE
                    WHEN DATE(u.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                    THEN u.user_id
                END
            ) AS new_customers,

            COUNT(DISTINCT o.user_id) AS customers_with_orders

        FROM users u

        INNER JOIN roles r
            ON r.role_id = u.role_id

        LEFT JOIN orders o
            ON o.user_id = u.user_id

        WHERE LOWER(r.name) = 'customer'
    `;

    const rows = await query(sql);

    return rows[0];

};