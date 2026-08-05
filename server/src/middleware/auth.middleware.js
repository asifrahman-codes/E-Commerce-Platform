import ApiError from "../utils/ApiError.js";

import asyncHandler from "../utils/asyncHandler.js";

import { verifyToken } from "../helpers/jwt.helper.js";

import { findUserById } from "../repositories/user.repository.js";

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

        const user = await findUserById(

            decoded.userId

        );

        if (!user) {

            throw new ApiError(

                401,

                "User not found"

            );

        }

        /*
        -----------------------------------------
        Check Status
        -----------------------------------------
        */

        if (user.status !== "ACTIVE") {

            throw new ApiError(
              
                403,
                "Account is not active"
            );
        }

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