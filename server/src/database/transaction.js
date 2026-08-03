import pool from "./connection.js";

export const getConnection = async () => {
  return await pool.getConnection();
};