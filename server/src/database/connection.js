
import mysql from "mysql2/promise";
import dbConfig from "../config/database.js";

const pool = mysql.createPool({
  host: dbConfig.host,
  port: Number(dbConfig.port || 3306),
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,

  timezone: "Z",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",

  // Enable verified TLS for cloud database connections.
  ssl:
    process.env.DB_SSL === "true"
      ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
      : undefined,
});

export default pool;
