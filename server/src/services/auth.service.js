import ApiError from "../utils/ApiError.js";

import {
    findUserByEmail,
    findRoleByName,
    createUser
} from "../repositories/auth.repository.js";

import {
    hashPassword
} from "../helpers/bcrypt.helper.js";

/**
 * Register User
 */
export const registerUser = async (userData) => {

    /*
    -----------------------------------------
    Check Email
    -----------------------------------------
    */

    const existingUser = await findUserByEmail(
        userData.email
    );

    if (existingUser) {

        throw new ApiError(
            409,
            "Email already exists"
        );

    }

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

    const userId = await createUser({

        roleId: customerRole.role_id,

        firstName: userData.firstName,

        lastName: userData.lastName,

        email: userData.email,

        password: hashedPassword,

        phone: userData.phone

    });

    /*
    -----------------------------------------
    Return
    -----------------------------------------
    */

    return {

        userId,

        email: userData.email

    };

};