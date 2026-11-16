/**
 * Secure admin seed.
 *
 *   ADMIN_EMAIL=owner@example.com ADMIN_PASSWORD='long-secret' npm run seed:admin
 *
 * - The password comes ONLY from the environment and is hashed with the
 *   application's own bcrypt helper. It is never logged or stored in plain text.
 * - Safe to re-run: an existing user is left untouched unless
 *   ADMIN_RESET_PASSWORD=true is set explicitly.
 * - Nothing is dropped or truncated. Missing roles are inserted, never replaced.
 */
import "../../config/env.js";
import { pool } from "../index.js";
import { hashPassword } from "../../utils/security/bcrypt.helper.js";

const fail = (message) => {
  console.error(`seed:admin failed: ${message}`);
  process.exitCode = 1;
};

async function main() {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const firstName = (process.env.ADMIN_FIRST_NAME || "Store").trim();
  const lastName = (process.env.ADMIN_LAST_NAME || "Admin").trim();
  const reset = process.env.ADMIN_RESET_PASSWORD === "true";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail("ADMIN_EMAIL is missing or invalid.");
  }

  if (password.length < 12) {
    return fail("ADMIN_PASSWORD must be set and at least 12 characters.");
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Roles are only inserted when absent (names are UNIQUE).
    for (const [name, description] of [
      ["Admin", "System Administrator"],
      ["Customer", "Registered Customer"],
    ]) {
      await connection.execute(
        "INSERT IGNORE INTO roles (name, description) VALUES (?, ?)",
        [name, description]
      );
    }

    const [[role]] = await connection.execute(
      "SELECT role_id FROM roles WHERE name = 'Admin' LIMIT 1"
    );

    const [existing] = await connection.execute(
      "SELECT user_id, role_id FROM users WHERE email = ? LIMIT 1 FOR UPDATE",
      [email]
    );

    if (existing.length === 0) {
      const hash = await hashPassword(password);

      await connection.execute(
        `INSERT INTO users
           (role_id, first_name, last_name, email, password, email_verified, status)
         VALUES (?, ?, ?, ?, ?, 1, 'ACTIVE')`,
        [role.role_id, firstName, lastName, email, hash]
      );

      console.log(`Admin user created: ${email}`);
    } else if (reset) {
      const hash = await hashPassword(password);

      await connection.execute(
        "UPDATE users SET password = ?, role_id = ?, status = 'ACTIVE' WHERE user_id = ?",
        [hash, role.role_id, existing[0].user_id]
      );

      await connection.execute(
        "UPDATE user_refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL",
        [existing[0].user_id]
      );

      console.log(`Admin password reset and sessions revoked: ${email}`);
    } else {
      console.log(
        `User ${email} already exists; nothing changed. ` +
          "Set ADMIN_RESET_PASSWORD=true to reset its password."
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    fail(error.message);
  } finally {
    connection.release();
    await pool.end();
  }
}

main();
