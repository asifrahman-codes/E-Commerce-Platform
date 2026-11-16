import jwt from "jsonwebtoken";

/**
 * Generate Access Token
 */
export const generateAccessToken = (payload) => {

    return jwt.sign(

        payload,

        process.env.JWT_SECRET,

        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }

    );

};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (payload) => {

    return jwt.sign(

        payload,

        process.env.JWT_REFRESH_SECRET,

        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
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
