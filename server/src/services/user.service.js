import ApiError from "../utils/ApiError.js";
import withTransaction from "../utils/transaction.js";

import {
    findUserById,
    findUserByIdForAuth,
    updateUserProfile,
    findUserPasswordById,
    updateUserPasswordWithTransaction,
    deactivateUserAccount,
} from "../repositories/user.repository.js";
import {
    revokeAllUserTokensWithTransaction,
} from "../repositories/token.repository.js";

import {
    comparePassword,
    hashPassword,
} from "../utils/security/bcrypt.helper.js";


/*
|--------------------------------------------------------------------------
| Get Authenticated User
|--------------------------------------------------------------------------
*/

export const getAuthenticatedUser = async (userId, tokenVersion) => {

    const user = await findUserByIdForAuth(userId);

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    if (user.status !== "ACTIVE") {
        throw new ApiError(403, "Account is not active");
    }

    if (
        tokenVersion !== undefined &&
        Number(tokenVersion) !== Number(user.token_version)
    ) {
        throw new ApiError(401, "Session has been revoked");
    }

    const { token_version, ...authenticatedUser } = user;
    return authenticatedUser;
};


/*
|--------------------------------------------------------------------------
| Update My Profile
|--------------------------------------------------------------------------
*/

export const updateMyProfileService = async (userId, data) => {

    const first_name = data.first_name?.trim();
    const last_name = data.last_name?.trim();
    const phone = data.phone?.trim() || null;

    if (!first_name || !last_name) {
        throw new ApiError(
            400,
            "First name and last name are required"
        );
    }

    if (first_name.length > 100 || last_name.length > 100) {
        throw new ApiError(
            400,
            "Name must not exceed 100 characters"
        );
    }

    if (phone && phone.length > 20) {
        throw new ApiError(
            400,
            "Phone number must not exceed 20 characters"
        );
    }

    const user = await findUserById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return updateUserProfile(userId, {
        first_name,
        last_name,
        phone,
    });
};


/*
|--------------------------------------------------------------------------
| Change My Password
|--------------------------------------------------------------------------
*/

export const changeMyPasswordService = async (userId, data) => {

    const {
        current_password,
        new_password,
        confirm_password,
    } = data;

    // Validate required fields

    if (!current_password || !new_password || !confirm_password) {
        throw new ApiError(
            400,
            "All password fields are required"
        );
    }

    // Validate password length

    if (new_password.length < 8) {
        throw new ApiError(
            400,
            "New password must contain at least 8 characters"
        );
    }

    // Confirm password

    if (new_password !== confirm_password) {
        throw new ApiError(
            400,
            "New passwords do not match"
        );
    }

    // Find user's existing password

    const user = await findUserPasswordById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // IMPORTANT: Database column is password, NOT password_hash.

    const isPasswordValid = await comparePassword(
        current_password,
        user.password
    );

    if (!isPasswordValid) {
        throw new ApiError(
            400,
            "Current password is incorrect"
        );
    }

    // Prevent using the same password again

    const samePassword = await comparePassword(
        new_password,
        user.password
    );

    if (samePassword) {
        throw new ApiError(
            400,
            "New password must be different from current password"
        );
    }

    // Hash new password using existing helper

    const hashedPassword = await hashPassword(new_password);

    // Update database

    await withTransaction(async (connection) => {
        const updated = await updateUserPasswordWithTransaction(
            connection,
            userId,
            hashedPassword
        );

        if (!updated) {
            throw new ApiError(404, "User not found");
        }

        await revokeAllUserTokensWithTransaction(connection, userId);
    });

    return true;
};


/*
|--------------------------------------------------------------------------
| Deactivate My Account
|--------------------------------------------------------------------------
*/

export const deactivateMyAccountService = async (userId, data) => {

    const { password } = data;

    if (!password) {
        throw new ApiError(
            400,
            "Password is required to deactivate your account"
        );
    }

    const user = await findUserPasswordById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await comparePassword(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw new ApiError(
            400,
            "Password is incorrect"
        );
    }

    const deactivated = await deactivateUserAccount(userId);

    if (!deactivated) {
        throw new ApiError(
            400,
            "Account could not be deactivated"
        );
    }

    return true;
};