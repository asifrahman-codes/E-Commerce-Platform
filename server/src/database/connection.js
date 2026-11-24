
import mysql from "mysql2/promise";
import dbConfig from "../config/database.js";

const sslEnabled = process.env.DB_SSL !== "true";

const pool = mysql.createPool({
  host: dbConfig.host,
  port: Number(dbConfig.port || 3306),
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,

  ssl: sslEnabled
    ? {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      }
    : undefined,

  timezone: "Z",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  charset: "utf8mb4",
});

export default pool;
