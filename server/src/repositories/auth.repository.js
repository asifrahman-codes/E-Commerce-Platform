import { query } from "../database/index.js";

/**
 * Find user by email
 */
export const findUserByEmail = async (email) => {

    const sql = `
        SELECT
            u.user_id,
            u.role_id,
            u.first_name,
            u.last_name,
            u.email,
            u.password,
            u.phone,
            u.profile_image,
            u.email_verified,
            u.status,
            r.name AS role
        FROM users u
        INNER JOIN roles r
            ON u.role_id = r.role_id
        WHERE u.email = ?
        LIMIT 1
    `;

    const users = await query(sql, [email]);

    return users[0] || null;

};

/**
 * Find role by name
 */
export const findRoleByName = async (roleName) => {

    const sql = `
        SELECT *
        FROM roles
        WHERE name = ?
        LIMIT 1
    `;

    const roles = await query(sql, [roleName]);

    return roles[0] || null;

};

/**
 * Create user
 */
export const createUser = async (userData) => {

    const sql = `
        INSERT INTO users
        (
            role_id,
            first_name,
            last_name,
            email,
            password,
            phone
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )
    `;

    const result = await query(sql, [

        userData.roleId,
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.password,
        userData.phone

    ]);

    return result.insertId;

};

