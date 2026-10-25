import "./config/env.js";

import app from "./app.js";
import { validateEnvironment } from "./config/env.js";
import { pool } from "./database/index.js";

let server;
let shuttingDown = false;

async function startServer() {
  const { port } = validateEnvironment();

  await pool.query("SELECT 1");

  server = app.listen(port, () => {
    console.log("=========================================");
    console.log("Server Started Successfully");
    console.log("Environment :", process.env.NODE_ENV || "development");
    console.log("Port        :", port);
    console.log("=========================================");
  });
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`Received ${signal}. Shutting down gracefully...`);

  const timeout = setTimeout(() => {
    console.error("Shutdown timed out.");
    process.exit(1);
  }, 15000);

  timeout.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await pool.end();

    clearTimeout(timeout);
    process.exit(0);
  } catch (error) {
    console.error("Shutdown failed:", error.message);
    process.exit(1);
  }
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});