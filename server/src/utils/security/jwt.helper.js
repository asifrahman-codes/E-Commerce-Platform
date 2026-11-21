import jwt from "jsonwebtoken";
import jwtConfig from "../../config/jwt.js";

/**
 * Generate Access Token
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(
        payload,
        jwtConfig.secret,
        {
            expiresIn: jwtConfig.expiresIn,
        }
    );
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (payload) => {
    return jwt.sign(
        payload,
        jwtConfig.refreshSecret,
        {
            expiresIn: jwtConfig.refreshExpiresIn,
        }
    );
};

/**
 * Verify Token
 */
export const verifyToken = (token, secret) => {

    return jwt.verify(

        token,

        secret

    );

};
/**
 * Expiry date of a signed token, read from its own exp claim,
 * so the database row can never disagree with the JWT.
 */
export const getTokenExpiryDate = (token) => {
    const decoded = jwt.decode(token);

    if (!decoded?.exp) {
        throw new Error("Token has no expiry claim");
    }

    return new Date(decoded.exp * 1000);
};
