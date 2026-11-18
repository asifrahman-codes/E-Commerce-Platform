import { query } from "../database/index.js";

export const findAddressesByUserId = async (userId) => {
    const sql = `
        SELECT *
        FROM addresses
        WHERE user_id = ?
        ORDER BY is_default DESC, created_at DESC
    `;

    return query(sql, [userId]);
};

export const findAddressById = async (addressId, userId) => {
    const sql = `
        SELECT *
        FROM addresses
        WHERE address_id = ?
        AND user_id = ?
        LIMIT 1
    `;

    const rows = await query(sql, [addressId, userId]);

    return rows[0] || null;
};

/**
 * Backward-compatible export used by order.service.js (checkout).
 * - findAddressByUserId(userId)             -> all addresses of the user
 * - findAddressByUserId(addressId, userId)  -> one address of the user
 */
export const findAddressByUserId = async (...args) => {
    if (args.length >= 2) {
        return findAddressById(args[0], args[1]);
    }

    return findAddressesByUserId(args[0]);
};

export const createAddress = async (userId, data) => {
    const sql = `
        INSERT INTO addresses (
            user_id,
            recipient_name,
            phone,
            address_line_1,
            address_line_2,
            city,
            state,
            postal_code,
            country,
            is_default
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
        userId,
        data.recipient_name,
        data.phone,
        data.address_line_1,
        data.address_line_2 || null,
        data.city,
        data.state || null,
        data.postal_code || null,
        data.country,
        data.is_default ? 1 : 0,
    ]);

    return findAddressById(result.insertId, userId);
};

export const updateAddress = async (addressId, userId, data) => {
    const sql = `
        UPDATE addresses
        SET
            recipient_name = ?,
            phone = ?,
            address_line_1 = ?,
            address_line_2 = ?,
            city = ?,
            state = ?,
            postal_code = ?,
            country = ?
        WHERE address_id = ?
        AND user_id = ?
    `;

    await query(sql, [
        data.recipient_name,
        data.phone,
        data.address_line_1,
        data.address_line_2 || null,
        data.city,
        data.state || null,
        data.postal_code || null,
        data.country,
        addressId,
        userId,
    ]);

    return findAddressById(addressId, userId);
};

export const deleteAddress = async (addressId, userId) => {
    const sql = `
        DELETE FROM addresses
        WHERE address_id = ?
        AND user_id = ?
    `;

    return query(sql, [addressId, userId]);
};

export const clearDefaultAddresses = async (userId) => {
    const sql = `
        UPDATE addresses
        SET is_default = FALSE
        WHERE user_id = ?
    `;

    await query(sql, [userId]);
};

export const setDefaultAddress = async (addressId, userId) => {
    const sql = `
        UPDATE addresses
        SET is_default = TRUE
        WHERE address_id = ?
        AND user_id = ?
    `;

    await query(sql, [addressId, userId]);
};