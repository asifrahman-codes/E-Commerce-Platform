import ApiError from "../utils/ApiError.js";

import { findUserById } from "../repositories/user.repository.js";

/**
 * Get authenticated user
 */
export const getAuthenticatedUser = async (userId) => {

    const user = await findUserById(userId);

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

    return user;

};