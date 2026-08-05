import { query } from "../database/index.js";

/**
 * Find User By ID
 */
export const findUserById = async (userId) => {

    const sql = `
        SELECT
            u.user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.role_id,
            r.name AS role,
            u.status
        FROM users u
        INNER JOIN roles r
            ON r.role_id = u.role_id
        WHERE u.user_id = ?
        LIMIT 1
    `;

    const users = await query(sql, [userId]);

    return users[0] || null;

};

// ==================== updateLastLogin =========================

export const updateLastLogin = async (userId) => {

    const sql = `
        UPDATE users
        SET last_login = NOW()
        WHERE user_id = ?
    `;

    await query(sql, [userId]);

};