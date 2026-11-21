import { query, pool } from "../database/index.js";

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
    payment_method,
    start_date,
    end_date,
    sort = "newest",
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

    if (payment_method) {
        conditions.push(`(
            p.payment_gateway = ?
            OR p.payment_method LIKE ?
        )`);
        values.push(payment_method, `%${payment_method}%`);
    }

    if (start_date) {
        conditions.push("o.created_at >= ?");
        values.push(start_date);
    }

    if (end_date) {
        conditions.push("o.created_at <= ?");
        values.push(end_date);
    }

    const where = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";
    const sortOrders = {
        newest: "o.created_at DESC, o.order_id DESC",
        oldest: "o.created_at ASC, o.order_id ASC",
        amount_asc: "o.total ASC, o.created_at DESC",
        amount_desc: "o.total DESC, o.created_at DESC",
    };
    const orderBy = sortOrders[sort] || sortOrders.newest;

    const safeLimit = toPositiveInt(limit, 10, 100);
    const safePage = toPositiveInt(page, 1);
    const offset = (safePage - 1) * safeLimit;

    // Left join latest payment per order to include payment gateway / method
    const paymentSubquery = `
        LEFT JOIN (
            SELECT p1.order_id, p1.payment_gateway, p1.payment_method
            FROM payments p1
            INNER JOIN (
                SELECT order_id, MAX(payment_id) AS max_id
                FROM payments
                GROUP BY order_id
            ) p2 ON p1.order_id = p2.order_id AND p1.payment_id = p2.max_id
        ) p ON p.order_id = o.order_id
    `;

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
            o.updated_at,
            u.first_name,
            u.last_name,
            u.email,
            u.phone,
            p.payment_gateway,
            p.payment_method,
            (
                SELECT COUNT(*)
                FROM order_items oi
                WHERE oi.order_id = o.order_id
            ) AS total_items
        FROM orders o
        INNER JOIN users u ON u.user_id = o.user_id
        ${paymentSubquery}
        ${where}
        ORDER BY ${orderBy}
        LIMIT ${safeLimit} OFFSET ${offset}
        `,
        values
    );

    const countRows = await query(
        `
        SELECT COUNT(*) AS total
        FROM orders o
        INNER JOIN users u ON u.user_id = o.user_id
        ${paymentSubquery}
        ${where}
        `,
        values
    );

    return {
        orders: rows,
        total: Number(countRows[0]?.total || 0),
    };
};

/*
|--------------------------------------------------------------------------
| Get Complete Order Details (Admin)
|--------------------------------------------------------------------------
*/

export const findAdminOrderById = async (orderId) => {
    const orders = await query(
        `
        SELECT
            o.*,
            u.first_name,
            u.last_name,
            u.email,
            u.phone,
            a.street AS shipping_street,
            a.city AS shipping_city,
            a.postal_code AS shipping_postal_code,
            a.country AS shipping_country,
            c.code AS coupon_code,
            c.discount_type AS coupon_discount_type,
            c.discount_value AS coupon_discount_value
        FROM orders o
        INNER JOIN users u ON u.user_id = o.user_id
        LEFT JOIN addresses a ON a.address_id = o.address_id
        LEFT JOIN coupons c ON c.coupon_id = o.coupon_id
        WHERE o.order_id = ?
        LIMIT 1
        `,
        [orderId]
    );

    if (!orders.length) return null;

    const order = orders[0];

    // Fetch order items with variant details & primary product image
    const items = await query(
        `
        SELECT
            oi.*,
            pv.size,
            pv.color,
            pv.sku AS variant_sku,
            pv.stock AS current_variant_stock,
            (
                SELECT pi.image_url
                FROM product_images pi
                WHERE pi.product_id = pv.product_id
                ORDER BY pi.is_primary DESC, pi.image_id ASC
                LIMIT 1
            ) AS image_url
        FROM order_items oi
        LEFT JOIN product_variants pv ON pv.variant_id = oi.variant_id
        WHERE oi.order_id = ?
        ORDER BY oi.order_item_id ASC
        `,
        [orderId]
    );

    // Fetch payments
    const payments = await query(
        `
        SELECT
            p.payment_id,
            p.order_id,
            p.transaction_id,
            p.payment_gateway,
            p.payment_method,
            p.amount,
            p.currency,
            p.status,
            p.paid_at,
            p.created_at,
            p.updated_at
        FROM payments p
        WHERE p.order_id = ?
        ORDER BY p.payment_id DESC
        `,
        [orderId]
    );

    // Fetch shipments with shipping method details
    const shipmentRows = await query(
        `
        SELECT
            s.*,
            sm.name AS shipping_method_name,
            sm.code AS shipping_method_code,
            sm.min_delivery_days,
            sm.max_delivery_days,
            sm.fee AS shipping_fee
        FROM shipments s
        INNER JOIN shipping_methods sm
            ON sm.shipping_method_id = s.shipping_method_id
        WHERE s.order_id = ?
        ORDER BY s.shipment_id DESC
        `,
        [orderId]
    );

    // Attach tracking events to each shipment
    const shipments = await Promise.all(
        shipmentRows.map(async (shipment) => {
            const trackingEvents = await query(
                `
                SELECT
                    tracking_event_id,
                    shipment_id,
                    status,
                    location,
                    description,
                    event_time,
                    created_at
                FROM shipment_tracking_events
                WHERE shipment_id = ?
                ORDER BY event_time DESC, tracking_event_id DESC
                `,
                [shipment.shipment_id]
            );

            return {
                ...shipment,
                tracking_events: trackingEvents,
            };
        })
    );

    // Fetch status history / audit trail
    const statusHistory = await query(
        `
        SELECT
            h.history_id,
            h.order_id,
            h.status,
            h.changed_by,
            h.notes,
            h.created_at,
            CONCAT_WS(' ', u.first_name, u.last_name) AS changed_by_name,
            u.email AS changed_by_email,
            r.name AS changed_by_role
        FROM order_status_history h
        LEFT JOIN users u ON u.user_id = h.changed_by
        LEFT JOIN roles r ON r.role_id = u.role_id
        WHERE h.order_id = ?
        ORDER BY h.created_at ASC, h.history_id ASC
        `,
        [orderId]
    );

    return {
        ...order,
        items,
        payments,
        primary_payment: payments[0] || null,
        payment_method: payments[0]?.payment_method || payments[0]?.payment_gateway || null,
        shipments,
        status_history: statusHistory,
    };
};

/*
|--------------------------------------------------------------------------
| Lock Order For Admin Transaction
|--------------------------------------------------------------------------
*/

export const findOrderForAdminUpdate = async (connection, orderId) => {
    const [rows] = await connection.execute(
        `
        SELECT
            o.*,
            u.email AS customer_email,
            u.first_name AS customer_first_name
        FROM orders o
        INNER JOIN users u ON u.user_id = o.user_id
        WHERE o.order_id = ?
        FOR UPDATE
        `,
        [orderId]
    );

    return rows[0] || null;
};

export const findOrderItemsForAdminUpdate = async (connection, orderId) => {
    const [rows] = await connection.execute(
        `SELECT variant_id, quantity
         FROM order_items
         WHERE order_id = ?`,
        [orderId]
    );

    return rows;
};

export const findPaymentForAdminUpdate = async (connection, orderId) => {
    const [rows] = await connection.execute(
        `SELECT payment_id, payment_gateway, status
         FROM payments
         WHERE order_id = ?
         LIMIT 1`,
        [orderId]
    );

    return rows[0] || null;
};

/*
|--------------------------------------------------------------------------
| Update Order Status In Transaction
|--------------------------------------------------------------------------
*/

export const updateAdminOrderStatusWithTransaction = async (
    connection,
    orderId,
    status
) => {
    const [result] = await connection.execute(
        `
        UPDATE orders
        SET status = ?
        WHERE order_id = ?
        `,
        [status, orderId]
    );

    return result.affectedRows > 0;
};

/*
|--------------------------------------------------------------------------
| Update Order Payment Status In Transaction
|--------------------------------------------------------------------------
*/

export const updateAdminPaymentStatusWithTransaction = async (
    connection,
    orderId,
    paymentStatus
) => {
    const [result] = await connection.execute(
        `
        UPDATE orders
        SET payment_status = ?
        WHERE order_id = ?
        `,
        [paymentStatus, orderId]
    );

    return result.affectedRows > 0;
};

/*
|--------------------------------------------------------------------------
| Insert Status History Record
|--------------------------------------------------------------------------
*/

export const insertOrderStatusHistoryWithTransaction = async (
    connection,
    { order_id, status, changed_by = null, notes = null }
) => {
    const [result] = await connection.execute(
        `
        INSERT INTO order_status_history (
            order_id,
            status,
            changed_by,
            notes
        )
        VALUES (?, ?, ?, ?)
        `,
        [order_id, status, changed_by, notes]
    );

    return result.insertId;
};

/*
|--------------------------------------------------------------------------
| Update Payment Row Status (COD, etc.)
|--------------------------------------------------------------------------
*/

export const updatePaymentRecordWithTransaction = async (
    connection,
    orderId,
    status,
    paidAt = null
) => {
    let sql;
    let params;

    if (paidAt) {
        sql = `
            UPDATE payments
            SET status = ?, paid_at = ?
            WHERE order_id = ?
        `;
        params = [status, paidAt, orderId];
    } else {
        sql = `
            UPDATE payments
            SET status = ?
            WHERE order_id = ?
        `;
        params = [status, orderId];
    }

    const [result] = await connection.execute(sql, params);
    return result.affectedRows > 0;
};
