import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hash Password
 */
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare Password
 */
export const comparePassword = async (
    password,
    hashedPassword
) => {
    return await bcrypt.compare(
        password,
        hashedPassword
    );
};