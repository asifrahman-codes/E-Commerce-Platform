import "dotenv/config";

import { validateEnvironment } from "./config/env.js";
import { pool } from "./database/index.js";
import { logger } from "./utils/logger.js";
import {
  runNotificationWorker,
} from "./services/notification-worker.service.js";

let stopWorker;

async function start() {
  validateEnvironment();
  await pool.query("SELECT 1");

  stopWorker = await runNotificationWorker();

  logger.info("Notification worker started");
}

async function shutdown(signal) {
  logger.info("Notification worker shutting down", { signal });

  try {
    if (stopWorker) {
      await stopWorker();
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    logger.error("Worker shutdown failed", {
      message: error.message,
    });
    process.exit(1);
  }
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

start().catch((error) => {
  logger.error("Worker startup failed", {
    message: error.message,
  });
  process.exit(1);
});