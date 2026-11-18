import bcrypt from "bcryptjs";

import ApiError from "../utils/ApiError.js";

import {
    findUserById,
    updateUserProfile,
    findUserPasswordById,
    updateUserPassword,
} from "../repositories/user.repository.js";

import {
    comparePassword,
    hashPassword,
} from "../utils/security/bcrypt.helper.js";


/*
|--------------------------------------------------------------------------
| Get Authenticated User
|--------------------------------------------------------------------------
*/

export const getAuthenticatedUser = async (userId) => {

    const user = await findUserById(userId);

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    if (user.status !== "ACTIVE") {
        throw new ApiError(403, "Account is not active");
    }

    return user;
};


/*
|--------------------------------------------------------------------------
| Update My Profile
|--------------------------------------------------------------------------
*/

export const updateMyProfileService = async (userId, data) => {

    const first_name = data.first_name?.trim();
    const last_name = data.last_name?.trim();

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

    const user = await findUserById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return updateUserProfile(userId, {
        first_name,
        last_name,
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

    await updateUserPassword(userId, hashedPassword);

    return true;
};