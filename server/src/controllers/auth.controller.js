import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    registerUser,
    loginUser
} from "../services/auth.service.js";

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/

export const register = asyncHandler(

    async (req, res) => {

        const user = await registerUser(req.body);

        return res
            .status(201)
            .json(

                new ApiResponse(
                    201,
                    "If registration can be completed for this email, you can now sign in. If an account already exists, use your existing password.",
                    user
                )

            );

    }

);

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export const login = asyncHandler(

    async (req, res) => {

        const result = await loginUser(req.body);

        return res
            .status(200)
            .json(

                new ApiResponse(

                    200,

                    "Login successful",

                    result

                )

            );

    }

);

export const getMe = asyncHandler(
    async (req, res) => {

        const u = req.user;

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Current user retrieved successfully",
                    {
                        user: {
                            userId:        u.user_id,
                            user_id:       u.user_id,
                            firstName:     u.first_name,
                            first_name:    u.first_name,
                            lastName:      u.last_name,
                            last_name:     u.last_name,
                            email:         u.email,
                            phone:         u.phone ?? null,
                            profileImage:  u.profile_image ?? null,
                            profile_image: u.profile_image ?? null,
                            role:          u.role,
                            roleId:        u.role_id,
                            emailVerified: u.email_verified ?? false,
                            email_verified: u.email_verified ?? false,
                            status:        u.status,
                            createdAt:     u.created_at,
                            created_at:    u.created_at,
                            lastLogin:     u.last_login,
                            last_login:    u.last_login,
                        }
                    }
                )
            );

    }
);
