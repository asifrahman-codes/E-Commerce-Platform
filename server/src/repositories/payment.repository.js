
/*
|--------------------------------------------------------------------------
| Payment Repository
|--------------------------------------------------------------------------
*/

import { query } from "../database/index.js";


/*
|--------------------------------------------------------------------------
| Find Order For Payment
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
                transaction_id,
                payment_gateway,
                payment_method,
                amount,
                currency,
                status,
                paid_at,
                created_at,
                updated_at
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
        transaction_id,
        payment_gateway,
        payment_method = null,
        amount,
        status = "PENDING"
    }
) => {
    const [result] = await connection.execute(
        `
            INSERT INTO payments (
                order_id,
                transaction_id,
                payment_gateway,
                payment_method,
                amount,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            order_id,
            transaction_id,
            payment_gateway,
            payment_method,
            amount,
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
    const rows = await query(
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
    const rows = await query(
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
    return await query(
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
            INNER JOIN orders o
                ON o.order_id = p.order_id
            WHERE o.user_id = ?
            ORDER BY p.created_at DESC, p.payment_id DESC
        `,
        [userId]
    );
};
