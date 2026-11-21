import ApiError from "../utils/ApiError.js";

import {
    findUserByEmail,
    findRoleByName,
    createUser,
} from "../repositories/auth.repository.js";

import {
    saveRefreshToken
} from "../repositories/token.repository.js";

import {
    updateLastLogin,
} from "../repositories/user.repository.js";

import {
    hashPassword
} from "../utils/security/bcrypt.helper.js";

import {
    comparePassword
} from "../utils/security/bcrypt.helper.js";

import {
    generateAccessToken,
    generateRefreshToken,
    getTokenExpiryDate
} from "../utils/security/jwt.helper.js";

/**
 * Register User
 */
export const registerUser = async (userData) => {
    /*
    -----------------------------------------
    Customer Role
    -----------------------------------------
    */

    const customerRole = await findRoleByName(
        "Customer"
    );

    if (!customerRole) {

        throw new ApiError(
            500,
            "Customer role not found"
        );

    }

    /*
    -----------------------------------------
    Hash Password
    -----------------------------------------
    */

    const hashedPassword = await hashPassword(
        userData.password
    );

    /*
    -----------------------------------------
    Create User
    -----------------------------------------
    */

    try {
        await createUser({
            roleId: customerRole.role_id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: hashedPassword,
            phone: userData.phone ?? null
        });
    } catch (error) {
        if (error.code !== "ER_DUP_ENTRY") {
            throw error;
        }
    }

    /*
    -----------------------------------------
    Return
    -----------------------------------------
    */

    return { accepted: true };

};

/**
 * Login User
 */
export const loginUser = async ({ email, password }) => {

    /*
    -----------------------------------------
    Find User
    -----------------------------------------
    */

    const user = await findUserByEmail(email);

    if (!user) {

        throw new ApiError(
            401,
            "Invalid email or password"
        );
    }

    /*
    -----------------------------------------
    Check User Status
    -----------------------------------------
    */

    if (user.status !== "ACTIVE") {

        throw new ApiError(
            401,
            "Invalid email or password"
        );
    }

    /*
    -----------------------------------------
    Compare Password
    -----------------------------------------
    */

    const passwordMatched = await comparePassword(
        password,
        user.password
    );

    if (!passwordMatched) {

        throw new ApiError(
            401,
            "Invalid email or password"
        );
    }

    // Password is correct
    await updateLastLogin(user.user_id);

    /*
    -----------------------------------------
    JWT Payload
    -----------------------------------------
    */

    const payload = {

        userId: user.user_id,
        roleId: user.role_id,
        email: user.email,
        tokenVersion: user.token_version
    };

    /*
    -----------------------------------------
    Generate Tokens
    -----------------------------------------
    */

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    /*
    -----------------------------------------
    Save Refresh Token
    -----------------------------------------
    */
    const expiresAt = getTokenExpiryDate(refreshToken);

    await saveRefreshToken({
    userId: user.user_id,
    token: refreshToken,
    expiresAt
});

    /*
    -----------------------------------------
    Remove Password
    -----------------------------------------
    */

    delete user.password;

    /*
    -----------------------------------------
    change the database row names
    -----------------------------------------
    */

    const responseUser = {

    userId: user.user_id,

    firstName: user.first_name,

    lastName: user.last_name,

    email: user.email,

    phone: user.phone,

    profileImage: user.profile_image,

    role: user.role,

    emailVerified: user.email_verified,

    status: user.status

};

    /*
    -----------------------------------------
    Return
    -----------------------------------------
    */

    return {
        user: responseUser,
        accessToken,
        refreshToken
    };
};