import pool from "./connection.js";

export const query = async (sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};