import jwt from "jsonwebtoken";

import ApiError from "../utils/ApiError.js";
import jwtConfig from "../config/jwt.js";
import withTransaction from "../utils/transaction.js";

import {
    generateAccessToken,
    generateRefreshToken,
    getTokenExpiryDate
} from "../utils/security/jwt.helper.js";

import {
    findRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens,
    revokeRefreshTokenIfActive,
    saveRefreshTokenWithTransaction,
    revokeAllUserTokensWithTransaction
} from "../repositories/token.repository.js";

import {
    findUserByIdForAuth
} from "../repositories/user.repository.js";


/**
 * Refresh Access Token
 */
export const refreshAccessToken = async (
    refreshToken
) => {

    /*
    -----------------------------------------
    Validate Input
    -----------------------------------------
    */

    if (!refreshToken) {

        throw new ApiError(
            401,
            "Refresh token is required"
        );

    }

    /*
    -----------------------------------------
    Check Database
    -----------------------------------------
    */

    const storedToken = await findRefreshToken(
        refreshToken
    );

    if (!storedToken) {

        throw new ApiError(
            401,
            "Invalid refresh token"
        );

    }

    /*
    -----------------------------------------
    Check Revoked
    -----------------------------------------
    */

    if (storedToken.revoked_at) {

        await revokeAllUserTokens(
            storedToken.user_id
        );

        throw new ApiError(
            401,
            "Refresh token has been revoked"
        );

    }

    /*
    -----------------------------------------
    Verify JWT
    -----------------------------------------
    */

    let decoded;

    try {

        decoded = jwt.verify(

            refreshToken,

            jwtConfig.refreshSecret

        );

    } catch {

        throw new ApiError(
            401,
            "Refresh token expired or invalid"
        );

    }

    /*
    -----------------------------------------
    Find User
    -----------------------------------------
    */

    const user = await findUserByIdForAuth(
        decoded.userId
    );

    if (!user) {

        throw new ApiError(
            401,
            "User not found"
        );

    }

    if (Number(storedToken.user_id) !== Number(user.user_id)) {
        throw new ApiError(
            401,
            "Invalid refresh token"
        );
    }

    if (Number(decoded.tokenVersion ?? 0) !== Number(user.token_version)) {
        await revokeAllUserTokens(user.user_id);
        throw new ApiError(
            401,
            "Refresh token has been revoked"
        );
    }

    if (user.status !== "ACTIVE") {

        throw new ApiError(
            403,
            "Account is not active"
        );

    }

    /*
    -----------------------------------------
    Token Rotation
    -----------------------------------------
    */

    const payload = {

        userId: user.user_id,

        roleId: user.role_id,

        email: user.email,

        tokenVersion: user.token_version

    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);
    const rotationSucceeded = await withTransaction(async (connection) => {
        const revoked = await revokeRefreshTokenIfActive(
            connection,
            refreshToken
        );

        if (!revoked) {
            await revokeAllUserTokensWithTransaction(
                connection,
                user.user_id
            );
            return false;
        }

        await saveRefreshTokenWithTransaction(connection, {
            userId: user.user_id,
            token: newRefreshToken,
            expiresAt: getTokenExpiryDate(newRefreshToken)
        });

        return true;
    });

    if (!rotationSucceeded) {
        throw new ApiError(
            401,
            "Refresh token has already been used"
        );
    }

    return {

        accessToken: newAccessToken,

        refreshToken: newRefreshToken

    };

};

/**
 * Logout
 */
export const logout = async (
    refreshToken
) => {

    if (!refreshToken) {

        throw new ApiError(
            400,
            "Refresh token is required"
        );

    }

    const token = await findRefreshToken(
        refreshToken
    );

    if (!token) {

        throw new ApiError(
            404,
            "Refresh token not found"
        );

    }

    await revokeRefreshToken(
        refreshToken
    );

    return;

};