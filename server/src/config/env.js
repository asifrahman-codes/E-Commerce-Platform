import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "DB_HOST",
  "DB_NAME",
  "DB_USER",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
];

export function validateEnvironment() {
  const errors = [];

  for (const key of requiredEnv) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }

  if (process.env.DB_PASSWORD === undefined) {
    errors.push("Missing required environment variable: DB_PASSWORD");
  }

  if (
    !process.env.JWT_REFRESH_SECRET &&
    !process.env.REFRESH_TOKEN_SECRET
  ) {
    errors.push(
      "Missing required environment variable: REFRESH_TOKEN_SECRET (or JWT_REFRESH_SECRET)"
    );
  }

  if (
    !process.env.JWT_REFRESH_EXPIRES_IN &&
    !process.env.REFRESH_TOKEN_EXPIRES_IN
  ) {
    errors.push(
      "Missing required environment variable: REFRESH_TOKEN_EXPIRES_IN (or JWT_REFRESH_EXPIRES_IN)"
    );
  }

  const port = Number(process.env.PORT || 5000);
  const databasePort = Number(process.env.DB_PORT || 3306);
  const logLevel = process.env.LOG_LEVEL?.toLowerCase();

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push("PORT must be a valid TCP port.");
  }

  if (
    !Number.isInteger(databasePort) ||
    databasePort < 1 ||
    databasePort > 65535
  ) {
    errors.push("DB_PORT must be a valid TCP port.");
  }

  if (
    logLevel &&
    !["debug", "info", "warn", "error"].includes(logLevel)
  ) {
    errors.push("LOG_LEVEL must be debug, info, warn, or error.");
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.JWT_SECRET &&
    process.env.JWT_SECRET.length < 32
  ) {
    errors.push("JWT_SECRET must be at least 32 characters in production.");
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  return { port };
}

export default process.env;