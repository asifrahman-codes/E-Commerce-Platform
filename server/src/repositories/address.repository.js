import { query } from "../database/index.js";


/*
|--------------------------------------------------------------------------
| Find Address By User
|--------------------------------------------------------------------------
*/

export const findAddressByUserId = async (
    addressId,
    userId
) => {

    const sql = `
        SELECT
            address_id,
            user_id,
            country,
            city,
            postal_code,
            street,
            is_default,
            created_at
        FROM addresses
        WHERE address_id = ?
          AND user_id = ?
        LIMIT 1
    `;


    const rows = await query(
        sql,
        [
            addressId,
            userId
        ]
    );


    return rows[0] || null;
};