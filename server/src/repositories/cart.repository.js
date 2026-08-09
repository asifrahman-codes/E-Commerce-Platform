import { query } from "../database/index.js";


/*
|--------------------------------------------------------------------------
| Find Cart By User
|--------------------------------------------------------------------------
*/

export const findCartByUserId = async (userId) => {

    const sql = `
        SELECT
            cart_id,
            user_id,
            created_at,
            updated_at
        FROM carts
        WHERE user_id = ?
        LIMIT 1
    `;

    const rows = await query(sql, [userId]);

    return rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Create Cart
|--------------------------------------------------------------------------
*/

export const createCart = async (userId) => {

    const sql = `
        INSERT INTO carts (user_id)
        VALUES (?)
        ON DUPLICATE KEY UPDATE
            cart_id = LAST_INSERT_ID(cart_id)
    `;

    const result = await query(sql, [userId]);

    return result.insertId;
};

/*
|--------------------------------------------------------------------------
| Find Cart Item
|--------------------------------------------------------------------------
*/

export const findCartItem = async (
    cartId,
    variantId
) => {

    const sql = `
        SELECT
            cart_item_id,
            cart_id,
            variant_id,
            quantity,
            created_at
        FROM cart_items
        WHERE cart_id = ?
          AND variant_id = ?
        LIMIT 1
    `;

    const rows = await query(sql, [
        cartId,
        variantId
    ]);

    return rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Find Cart Item By ID
|--------------------------------------------------------------------------
*/

export const findCartItemById = async (
    cartItemId
) => {

    const sql = `
        SELECT
            cart_item_id,
            cart_id,
            variant_id,
            quantity,
            created_at
        FROM cart_items
        WHERE cart_item_id = ?
        LIMIT 1
    `;

    const rows = await query(sql, [cartItemId]);

    return rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Add Cart Item
|--------------------------------------------------------------------------
*/

export const addCartItem = async ({
    cartId,
    variantId,
    quantity
}) => {

    const sql = `
        INSERT INTO cart_items (
            cart_id,
            variant_id,
            quantity
        )
        VALUES (?, ?, ?)
    `;

    const result = await query(sql, [
        cartId,
        variantId,
        quantity
    ]);

    return result.insertId;
};


/*
|--------------------------------------------------------------------------
| Update Cart Item
|--------------------------------------------------------------------------
*/

export const updateCartItem = async (
    cartItemId,
    quantity
) => {

    const sql = `
        UPDATE cart_items
        SET quantity = ?
        WHERE cart_item_id = ?
    `;

    const result = await query(sql, [
        quantity,
        cartItemId
    ]);

    return result.affectedRows;
};


/*
|--------------------------------------------------------------------------
| Delete Cart Item
|--------------------------------------------------------------------------
*/

export const deleteCartItem = async (
    cartItemId
) => {

    const sql = `
        DELETE FROM cart_items
        WHERE cart_item_id = ?
    `;

    const result = await query(sql, [
        cartItemId
    ]);

    return result.affectedRows;
};


/*
|--------------------------------------------------------------------------
| Clear Cart
|--------------------------------------------------------------------------
*/

export const clearCart = async (cartId) => {

    const sql = `
        DELETE FROM cart_items
        WHERE cart_id = ?
    `;

    const result = await query(sql, [cartId]);

    return result.affectedRows;
};

/*
|--------------------------------------------------------------------------
| Clear Cart With Transaction
|--------------------------------------------------------------------------
*/

export const clearCartWithTransaction = async (
    connection,
    cartId
) => {

    const [result] = await connection.execute(
        `
            DELETE FROM cart_items
            WHERE cart_id = ?
        `,
        [cartId]
    );

    return result.affectedRows;
};

/*
|--------------------------------------------------------------------------
| Get Cart With Items
|--------------------------------------------------------------------------
*/

export const getCartWithItems = async (
    cartId
) => {

    const sql = `
        SELECT

            c.cart_id,
            c.user_id,
            c.created_at AS cart_created_at,
            c.updated_at AS cart_updated_at,

            ci.cart_item_id,
            ci.variant_id,
            ci.quantity,
            ci.created_at AS item_created_at,

            pv.sku,
            pv.size,
            pv.color,
            pv.price_adjustment,
            pv.stock,
            pv.status AS variant_status,

            p.product_id,
            p.name AS product_name,
            p.base_price AS product_price

        FROM carts c

        LEFT JOIN cart_items ci
            ON c.cart_id = ci.cart_id

        LEFT JOIN product_variants pv
            ON ci.variant_id = pv.variant_id

        LEFT JOIN products p
            ON pv.product_id = p.product_id

        WHERE c.cart_id = ?

        ORDER BY ci.cart_item_id ASC
    `;

    return await query(sql, [cartId]);
};