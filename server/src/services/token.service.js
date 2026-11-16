import jwt from "jsonwebtoken";

import ApiError from "../utils/ApiError.js";

import {
    generateAccessToken,
    generateRefreshToken,
    getTokenExpiryDate
} from "../utils/security/jwt.helper.js";

import {
    saveRefreshToken,
    findRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens
} from "../repositories/token.repository.js";

import {
    findUserById,
    updateLastLogin
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

            process.env.JWT_REFRESH_SECRET || process.env.REFRESH_TOKEN_SECRET

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

    const user = await findUserById(
        decoded.userId
    );

    if (!user) {

        throw new ApiError(
            401,
            "User not found"
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

    await revokeRefreshToken(
        refreshToken
    );

    const payload = {

        userId: user.user_id,

        roleId: user.role_id,

        email: user.email

    };

    const newAccessToken =
        generateAccessToken(payload);

    const newRefreshToken =
        generateRefreshToken(payload);

    await saveRefreshToken({

        userId: user.user_id,

        token: newRefreshToken,

        expiresAt: getTokenExpiryDate(newRefreshToken)

    });

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