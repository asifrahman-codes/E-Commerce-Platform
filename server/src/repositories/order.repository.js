import {pool} from "../database/index.js";

export const createOrder = async (
    connection,
    orderData
) => {

    const {
        user_id,
        address_id,
        coupon_id = null,
        order_number,
        subtotal,
        discount = 0,
        shipping = 0,
        tax = 0,
        total
    } = orderData;


    const sql = `
        INSERT INTO orders (
            user_id,
            address_id,
            coupon_id,
            order_number,
            subtotal,
            discount,
            shipping,
            tax,
            total,
            status,
            payment_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'PENDING')
    `;


    const [result] = await connection.execute(
        sql,
        [
            user_id,
            address_id,
            coupon_id,
            order_number,
            subtotal,
            discount,
            shipping,
            tax,
            total
        ]
    );


    return result.insertId;
};


/*
|--------------------------------------------------------------------------
| Create Order Item
|--------------------------------------------------------------------------
*/

export const createOrderItem = async (
    connection,
    orderItemData
) => {

    const {
        order_id,
        variant_id,
        product_name,
        sku,
        unit_price,
        quantity,
        total_price
    } = orderItemData;


    const sql = `
        INSERT INTO order_items (
            order_id,
            variant_id,
            product_name,
            sku,
            unit_price,
            quantity,
            total_price
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;


    const [result] = await connection.execute(
        sql,
        [
            order_id,
            variant_id,
            product_name,
            sku,
            unit_price,
            quantity,
            total_price
        ]
    );


    return result.insertId;
};


/*
|--------------------------------------------------------------------------
| Find Order By ID
|--------------------------------------------------------------------------
*/

export const findOrderById = async (
    orderId
) => {

    const sql = `
        SELECT
            order_id,
            user_id,
            address_id,
            coupon_id,
            order_number,
            subtotal,
            discount,
            shipping,
            tax,
            total,
            status,
            payment_status,
            created_at,
            updated_at
        FROM orders
        WHERE order_id = ?
        LIMIT 1
    `;


    const [rows] = await pool.execute(
        sql,
        [orderId]
    );


    return rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Find Order By Number
|--------------------------------------------------------------------------
*/

export const findOrderByNumber = async (
    orderNumber
) => {

    const sql = `
        SELECT
            order_id,
            user_id,
            address_id,
            coupon_id,
            order_number,
            subtotal,
            discount,
            shipping,
            tax,
            total,
            status,
            payment_status,
            created_at,
            updated_at
        FROM orders
        WHERE order_number = ?
        LIMIT 1
    `;


    const [rows] = await pool.execute(
        sql,
        [orderNumber]
    );


    return rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Find Orders By User
|--------------------------------------------------------------------------
*/

export const findOrdersByUser = async (
    userId
) => {

    const sql = `
        SELECT
            order_id,
            user_id,
            address_id,
            coupon_id,
            order_number,
            subtotal,
            discount,
            shipping,
            tax,
            total,
            status,
            payment_status,
            created_at,
            updated_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;


    const [rows] = await pool.execute(
        sql,
        [userId]
    );


    return rows;
};


/*
|--------------------------------------------------------------------------
| Find Order Items
|--------------------------------------------------------------------------
*/

export const findOrderItems = async (
    orderId
) => {

    const sql = `
        SELECT
            order_item_id,
            order_id,
            variant_id,
            product_name,
            sku,
            unit_price,
            quantity,
            total_price,
            created_at
        FROM order_items
        WHERE order_id = ?
        ORDER BY order_item_id ASC
    `;


    const [rows] = await pool.execute(
        sql,
        [orderId]
    );


    return rows;
};


/*
|--------------------------------------------------------------------------
| Find Order With Items
|--------------------------------------------------------------------------
*/

export const findOrderWithItems = async (
    orderId
) => {

    const order = await findOrderById(
        orderId
    );


    if (!order) {
        return null;
    }


    const items = await findOrderItems(
        orderId
    );


    return {
        ...order,
        items
    };

};


/*
|--------------------------------------------------------------------------
| Update Order Status
|--------------------------------------------------------------------------
*/

export const updateOrderStatus = async (
    connection,
    orderId,
    status
) => {

    const sql = `
        UPDATE orders
        SET status = ?
        WHERE order_id = ?
    `;


    const [result] = await connection.execute(
        sql,
        [
            status,
            orderId
        ]
    );


    return result.affectedRows;
};


/*
|--------------------------------------------------------------------------
| Update Payment Status
|--------------------------------------------------------------------------
*/

export const updatePaymentStatus = async (
    connection,
    orderId,
    paymentStatus
) => {

    const sql = `
        UPDATE orders
        SET payment_status = ?
        WHERE order_id = ?
    `;


    const [result] = await connection.execute(
        sql,
        [
            paymentStatus,
            orderId
        ]
    );


    return result.affectedRows;
};