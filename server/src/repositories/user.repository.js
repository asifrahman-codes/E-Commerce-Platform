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
            u.phone,
            u.role_id,
            r.name AS role,
            u.status,
            u.created_at,
            u.last_login
        FROM users u
        INNER JOIN roles r
            ON r.role_id = u.role_id
        WHERE u.user_id = ?
        LIMIT 1
    `;

    const users = await query(sql, [userId]);

    return users[0] || null;

};

export const findUserByIdForAuth = async (userId) => {
    const users = await query(
        `SELECT
            u.user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.phone,
            u.role_id,
            r.name AS role,
            u.status,
            u.token_version,
            u.created_at,
            u.last_login
         FROM users u
         INNER JOIN roles r ON r.role_id = u.role_id
         WHERE u.user_id = ?
         LIMIT 1`,
        [userId]
    );

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

export const updateUserProfile = async (userId, profileData) => {
    const { first_name, last_name, phone } = profileData;

    const sql = `
        UPDATE users
        SET
            first_name = ?,
            last_name = ?,
            phone = ?
        WHERE user_id = ?
    `;

    await query(sql, [first_name, last_name, phone ?? null, userId]);

    return findUserById(userId);
};

/**
 * Find User Password By ID
 */
export const findUserPasswordById = async (userId) => {

    const sql = `
        SELECT
            user_id,
            password
        FROM users
        WHERE user_id = ?
        LIMIT 1
    `;

    const users = await query(sql, [userId]);

    return users[0] || null;
};


export const updateUserPasswordWithTransaction = async (
    connection,
    userId,
    hashedPassword
) => {
    const [result] = await connection.execute(
        `UPDATE users
         SET password = ?,
             token_version = token_version + 1
         WHERE user_id = ?`,
        [hashedPassword, userId]
    );

    return result.affectedRows > 0;
};

/**
 * Deactivate User Account
 */
export const deactivateUserAccount = async (userId) => {

    const sql = `
        UPDATE users
        SET status = 'INACTIVE'
        WHERE user_id = ?
        AND status = 'ACTIVE'
    `;

    const result = await query(sql, [userId]);

    return result.affectedRows > 0;
};