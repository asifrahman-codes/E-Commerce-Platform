import ApiError from "../utils/ApiError.js";

import asyncHandler from "../utils/asyncHandler.js";

import { verifyToken } from "../utils/security/jwt.helper.js";

import { getAuthenticatedUser } from "../services/user.service.js";

const authMiddleware = asyncHandler(

    async (req, res, next) => {

        /*
        -----------------------------------------
        Get Authorization Header
        -----------------------------------------
        */

        const authHeader = req.headers.authorization;

        if (!authHeader) {

            throw new ApiError(

                401,

                "Access token is required"

            );

        }

        /*
        -----------------------------------------
        Bearer Token
        -----------------------------------------
        */

        if (!authHeader.startsWith("Bearer ")) {

            throw new ApiError(

                401,

                "Invalid authorization header"

            );

        }

        /*
        -----------------------------------------
        Extract Token
        -----------------------------------------
        */

        const token = authHeader.split(" ")[1];

        /*
        -----------------------------------------
        Verify Token
        -----------------------------------------
        */

        const decoded = verifyToken(

            token,

            process.env.JWT_SECRET

        );

        /*
        -----------------------------------------
        Find User
        -----------------------------------------
        */

       const user = await getAuthenticatedUser(
        decoded.userId
      );

        /*
        -----------------------------------------
        Attach User
        -----------------------------------------
        */

        req.user = user;

        next();

    }

);

export default authMiddleware;