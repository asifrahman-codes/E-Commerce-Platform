import { query } from "../database/index.js";

const ADDRESS_COLUMNS = `
    address_id,
    user_id,
    country,
    city,
    postal_code,
    street,
    is_default,
    created_at
`;

/*
|--------------------------------------------------------------------------
| Find one address that belongs to a user (ownership enforced in SQL)
|--------------------------------------------------------------------------
*/

export const findAddressByUserId = async (
    addressId,
    userId
) => {

    const rows = await query(
        `SELECT ${ADDRESS_COLUMNS}
         FROM addresses
         WHERE address_id = ?
           AND user_id = ?
         LIMIT 1`,
        [addressId, userId]
    );

    return rows[0] || null;

};

export const findAddressesByUser = async (userId) => {

    return await query(
        `SELECT ${ADDRESS_COLUMNS}
         FROM addresses
         WHERE user_id = ?
         ORDER BY is_default DESC, address_id DESC`,
        [userId]
    );

};

/*
|--------------------------------------------------------------------------
| Transactional helpers (connection supplied by withTransaction)
|--------------------------------------------------------------------------
*/

// Locks the user's address rows so default handling cannot race.
export const lockUserAddresses = async (
    connection,
    userId
) => {

    const [rows] = await connection.execute(
        `SELECT address_id, is_default
         FROM addresses
         WHERE user_id = ?
         FOR UPDATE`,
        [userId]
    );

    return rows;

};

export const insertAddress = async (
    connection,
    {
        userId,
        country,
        city,
        postalCode,
        street,
        isDefault
    }
) => {

    const [result] = await connection.execute(
        `INSERT INTO addresses
            (user_id, country, city, postal_code, street, is_default)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            userId,
            country,
            city,
            postalCode ?? null,
            street,
            isDefault ? 1 : 0
        ]
    );

    return result.insertId;

};

// Only whitelisted columns can ever be updated (no mass assignment).
export const updateAddressFields = async (
    connection,
    addressId,
    userId,
    fields
) => {

    const allowed = {
        country: "country",
        city: "city",
        postal_code: "postal_code",
        street: "street"
    };

    const columns = [];
    const values = [];

    for (const [key, column] of Object.entries(allowed)) {

        if (Object.hasOwn(fields, key)) {

            columns.push(`${column} = ?`);
            values.push(fields[key] ?? null);

        }

    }

    if (columns.length === 0) {
        return 0;
    }

    values.push(addressId, userId);

    const [result] = await connection.execute(
        `UPDATE addresses
         SET ${columns.join(", ")}
         WHERE address_id = ?
           AND user_id = ?`,
        values
    );

    return result.affectedRows;

};

export const clearDefaultAddresses = async (
    connection,
    userId
) => {

    await connection.execute(
        `UPDATE addresses
         SET is_default = 0
         WHERE user_id = ?
           AND is_default = 1`,
        [userId]
    );

};

export const markAddressDefault = async (
    connection,
    addressId,
    userId
) => {

    await connection.execute(
        `UPDATE addresses
         SET is_default = 1
         WHERE address_id = ?
           AND user_id = ?`,
        [addressId, userId]
    );

};

export const removeAddress = async (
    connection,
    addressId,
    userId
) => {

    const [result] = await connection.execute(
        `DELETE FROM addresses
         WHERE address_id = ?
           AND user_id = ?`,
        [addressId, userId]
    );

    return result.affectedRows;

};

export const findAddressForUser = async (
    connection,
    addressId,
    userId
) => {

    const [rows] = await connection.execute(
        `SELECT ${ADDRESS_COLUMNS}
         FROM addresses
         WHERE address_id = ?
           AND user_id = ?
         LIMIT 1`,
        [addressId, userId]
    );

    return rows[0] || null;

};
