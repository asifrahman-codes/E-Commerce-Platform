import { query } from "../database/index.js";

const toPositiveInt = (value, fallback, max = Number.MAX_SAFE_INTEGER) => {
    const number = Number.parseInt(value, 10);

    if (!Number.isInteger(number) || number < 1) {
        return fallback;
    }

    return Math.min(number, max);
};

/*
|--------------------------------------------------------------------------
| Get All Orders (Admin)
|--------------------------------------------------------------------------
*/

export const findAllOrders = async ({
    page,
    limit,
    search,
    status,
    payment_status,
}) => {
    const conditions = [];
    const values = [];

    if (search) {
        conditions.push(`(
            o.order_number LIKE ?
            OR u.email LIKE ?
            OR u.first_name LIKE ?
            OR u.last_name LIKE ?
        )`);

        const term = `%${search}%`;

        values.push(term, term, term, term);
    }

    if (status) {
        conditions.push("o.status = ?");
        values.push(status);
    }

    if (payment_status) {
        conditions.push("o.payment_status = ?");
        values.push(payment_status);
    }

    const where = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const safeLimit = toPositiveInt(limit, 10, 100);
    const safePage = toPositiveInt(page, 1);
    const offset = (safePage - 1) * safeLimit;

    const rows = await query(
        `
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
        INNER JOIN users u ON u.user_id = o.user_id
        ${where}
        ORDER BY o.created_at DESC
        LIMIT ${safeLimit} OFFSET ${offset}
        `,
        values
    );

    const countRows = await query(
        `
        SELECT COUNT(*) AS total
        FROM orders o
        INNER JOIN users u ON u.user_id = o.user_id
        ${where}
        `,
        values
    );

    return {
        orders: rows,
        total: Number(countRows[0].total),
    };
};

/*
|--------------------------------------------------------------------------
| Get Complete Order Details
|--------------------------------------------------------------------------
*/

export const findAdminOrderById = async (orderId) => {
    const orders = await query(
        `
        SELECT
            o.*,
            u.first_name,
            u.last_name,
            u.email
        FROM orders o
        INNER JOIN users u ON u.user_id = o.user_id
        WHERE o.order_id = ?
        LIMIT 1
        `,
        [orderId]
    );

    if (!orders.length) return null;

    const order = orders[0];

    const items = await query(
        `
        SELECT *
        FROM order_items
        WHERE order_id = ?
        ORDER BY order_item_id ASC
        `,
        [orderId]
    );

    const shipments = await query(
        `
        SELECT
            s.*,
            sm.name AS shipping_method_name,
            sm.code AS shipping_method_code
        FROM shipments s
        INNER JOIN shipping_methods sm
            ON sm.shipping_method_id = s.shipping_method_id
        WHERE s.order_id = ?
        ORDER BY s.shipment_id DESC
        `,
        [orderId]
    );

    return {
        ...order,
        items,
        shipments,
    };
};