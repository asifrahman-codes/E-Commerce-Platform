import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    refreshAccessToken,
    logout
} from "../services/token.service.js";

/**
 * Refresh Access Token
 */
export const refreshToken = asyncHandler(

    async (req, res) => {

        const { refreshToken } = req.body;

        const tokens = await refreshAccessToken(
            refreshToken
        );

        return res
            .status(200)
            .json(

                new ApiResponse(

                    200,

                    "Access token refreshed successfully",

                    tokens

                )

            );

    }

);

/**
 * Logout User
 */
export const logoutUser = asyncHandler(

    async (req, res) => {

        const { refreshToken } = req.body;

        await logout(refreshToken);

        return res
            .status(200)
            .json(

                new ApiResponse(

                    200,

                    "Logout successful"

                )

            );

    }

);