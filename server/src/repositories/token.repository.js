import { query } from "../database/index.js";

/**
 * Save Refresh Token
 */
export const saveRefreshToken = async ({
    userId,
    token,
    expiresAt
}) => {

  console.log("Repository values:", {
    userId,
    token,
    expiresAt
});

    const sql = `
        INSERT INTO user_refresh_tokens
        (
            user_id,
            token,
            expires_at
        )
        VALUES
        (
            ?,
            ?,
            ?
        )
    `;

    return await query(sql, [

        userId,
        token,
        expiresAt

    ]);

};

/**
 * Find Refresh Token
 */
export const findRefreshToken = async (token) => {

    const sql = `
        SELECT
            id,
            user_id,
            token,
            expires_at,
            revoked_at,
            created_at
        FROM user_refresh_tokens
        WHERE token = ?
        LIMIT 1
    `;

    const tokens = await query(sql, [token]);

    return tokens[0] || null;

};

/**
 * Revoke Refresh Token
 */
export const revokeRefreshToken = async (token) => {

    const sql = `
        UPDATE user_refresh_tokens
        SET revoked_at = NOW()
        WHERE token = ?
        AND revoked_at IS NULL
    `;

    return await query(sql, [token]);

};

/**
 * Revoke All User Tokens
 */
export const revokeAllUserTokens = async (userId) => {

    const sql = `
        UPDATE user_refresh_tokens
        SET revoked_at = NOW()
        WHERE user_id = ?
        AND revoked_at IS NULL
    `;

    return await query(sql, [userId]);

};

/**
 * Delete Expired Tokens
 */
export const deleteExpiredTokens = async () => {

    const sql = `
        DELETE
        FROM user_refresh_tokens
        WHERE expires_at < NOW()
    `;

    return await query(sql);

};