import ApiError from "../utils/ApiError.js";

/**
 * Role Authorization Middleware
 */
const authorize = (...allowedRoles) => {

    return (req, res, next) => {

        /*
        -----------------------------------------
        User Exists?
        -----------------------------------------
        */

        if (!req.user) {

            throw new ApiError(

                401,

                "Authentication required"

            );

        }

        /*
        -----------------------------------------
        Check Role
        -----------------------------------------
        */

        if (!allowedRoles.includes(req.user.role)) {

            throw new ApiError(

                403,

                "You do not have permission to perform this action"

            );

        }

        next();

    };

};

export default authorize;