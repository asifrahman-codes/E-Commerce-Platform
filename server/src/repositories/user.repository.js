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

export const updateUserProfile = async (userId, profileData) => {
    const { first_name, last_name } = profileData;

    const sql = `
        UPDATE users
        SET
            first_name = ?,
            last_name = ?
        WHERE user_id = ?
    `;

    await query(sql, [first_name, last_name, userId]);

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


/**
 * Update User Password
 */
export const updateUserPassword = async (
    userId,
    hashedPassword
) => {

    const sql = `
        UPDATE users
        SET password = ?
        WHERE user_id = ?
    `;

    await query(sql, [hashedPassword, userId]);
};