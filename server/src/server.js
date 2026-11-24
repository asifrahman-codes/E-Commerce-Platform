import { validateEnvironment } from "./config/env.js";
import serverConfig from "./config/server.js";
import app from "./app.js";
import { pool } from "./database/index.js";
import { logger } from "./utils/logger.js";

let server;
let shuttingDown = false;

async function startServer() {
  validateEnvironment();
  const { port } = serverConfig;

  await pool.query("SELECT 1");

  server = app.listen(port, () => {
    logger.info("Server started", {
      environment: serverConfig.nodeEnv,
      port,
    });
  });
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info("Graceful shutdown started", { signal });

  const timeout = setTimeout(() => {
    logger.error("Shutdown timed out");
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
    console.error("STARTUP ERROR DETAILS:", error);
    logger.error("Server startup failed");
    process.exit(1);
  }
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

startServer().catch((error) => {
  logger.error("Server startup failed", { message: error.message });
  process.exit(1);
});