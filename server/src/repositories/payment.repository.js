
/*
|--------------------------------------------------------------------------
| Payment Repository
|--------------------------------------------------------------------------
*/

export const findOrderForPayment = async (
    connection,
    orderId,
    userId
) => {
    const [rows] = await connection.execute(
        `
            SELECT
                order_id,
                user_id,
                total,
                status,
                payment_status
            FROM orders
            WHERE order_id = ?
              AND user_id = ?
            LIMIT 1
            FOR UPDATE
        `,
        [orderId, userId]
    );

    return rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Find Payment By Order ID
|--------------------------------------------------------------------------
*/

export const findPaymentByOrderId = async (
    connection,
    orderId
) => {
    const [rows] = await connection.execute(
        `
            SELECT
                payment_id,
                order_id,
                amount,
                method,
                status,
                transaction_reference,
                paid_at,
                created_at
            FROM payments
            WHERE order_id = ?
            LIMIT 1
        `,
        [orderId]
    );

    return rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Create Payment
|--------------------------------------------------------------------------
*/

export const createPayment = async (
    connection,
    {
        order_id,
        amount,
        method,
        status = "PENDING"
    }
) => {
    const [result] = await connection.execute(
        `
            INSERT INTO payments (
                order_id,
                amount,
                method,
                status
            )
            VALUES (?, ?, ?, ?)
        `,
        [
            order_id,
            amount,
            method,
            status
        ]
    );

    return result.insertId;
};


/*
|--------------------------------------------------------------------------
| Find Payment By ID For Owner
|--------------------------------------------------------------------------
*/

export const findPaymentByIdForOwner = async (
    paymentId,
    userId
) => {
    const { query } = await import("../database/index.js");

    const rows = await query(
        `
            SELECT
                p.payment_id,
                p.order_id,
                p.amount,
                p.method,
                p.status,
                p.transaction_reference,
                p.paid_at,
                p.created_at
            FROM payments p
            INNER JOIN orders o
                ON o.order_id = p.order_id
            WHERE p.payment_id = ?
              AND o.user_id = ?
            LIMIT 1
        `,
        [paymentId, userId]
    );

    return rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Find Payment By Order ID For Owner
|--------------------------------------------------------------------------
*/

export const findPaymentByOrderIdForOwner = async (
    orderId,
    userId
) => {
    const { query } = await import("../database/index.js");

    const rows = await query(
        `
            SELECT
                p.payment_id,
                p.order_id,
                p.amount,
                p.method,
                p.status,
                p.transaction_reference,
                p.paid_at,
                p.created_at
            FROM payments p
            INNER JOIN orders o
                ON o.order_id = p.order_id
            WHERE p.order_id = ?
              AND o.user_id = ?
            LIMIT 1
        `,
        [orderId, userId]
    );

    return rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Find User Payments
|--------------------------------------------------------------------------
*/

export const findPaymentsByUser = async (userId) => {
    const { query } = await import("../database/index.js");

    return await query(
        `
            SELECT
                p.payment_id,
                p.order_id,
                p.amount,
                p.method,
                p.status,
                p.transaction_reference,
                p.paid_at,
                p.created_at
            FROM payments p
            INNER JOIN orders o
                ON o.order_id = p.order_id
            WHERE o.user_id = ?
            ORDER BY p.created_at DESC, p.payment_id DESC
        `,
        [userId]
    );
};
