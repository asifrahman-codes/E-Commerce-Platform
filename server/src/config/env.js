import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "DB_HOST",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "JWT_SECRET",
];

export function validateEnvironment() {
  const errors = [];

  for (const key of requiredEnv) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }

  const port = Number(process.env.PORT || 5000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push("PORT must be a valid TCP port.");
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

// Preserve existing behavior: validate immediately on import.
validateEnvironment();

export default process.env;