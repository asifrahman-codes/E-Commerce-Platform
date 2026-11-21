import { pool } from "../database/index.js";
import { logger } from "./logger.js";


/*
|--------------------------------------------------------------------------
| Execute Database Transaction
|--------------------------------------------------------------------------
*/

const withTransaction = async (callback) => {
    const connection = await pool.getConnection();
    let transactionStarted = false;

    try {
        await connection.beginTransaction();
        transactionStarted = true;

        const result = await callback(connection);

        await connection.commit();
        transactionStarted = false;
        return result;
    } catch (error) {
        if (transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                logger.error("Database transaction rollback failed", {
                    error: rollbackError.message,
                    originalError: error.message,
                });
            }
        }

        throw error;
    } finally {
        connection.release();
    }
};


export default withTransaction;