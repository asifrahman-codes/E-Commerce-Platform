import { pool } from "../database/index.js";
import {
  claimNotificationBatch,
  completeNotification,
  retryNotification,
  recoverStaleNotifications,
} from "../repositories/notification-outbox.repository.js";
import { sendNotificationEmail } from "./email.service.js";
import { logger } from "../utils/logger.js";

const MAX_ATTEMPTS = 8;

function parsePayload(payload) {
  return typeof payload === "string"
    ? JSON.parse(payload)
    : payload;
}

async function processNotification(event) {
  const payload = parsePayload(event.payload);

  if (!payload?.title || !payload?.message) {
    throw new Error("Invalid notification payload.");
  }

  // First create/update the in-app notification idempotently.
  await pool.execute(
    `INSERT INTO notifications
      (user_id, event_key, type, title, message, data, is_read)
     VALUES (?, ?, ?, ?, ?, ?, FALSE)
     ON DUPLICATE KEY UPDATE
       notification_id = LAST_INSERT_ID(notification_id)`,
    [
      event.user_id,
      event.event_key,
      event.event_type,
      payload.title,
      payload.message,
      JSON.stringify(payload.data || {}),
    ]
  );

  // Read the recipient from the database, not from a user-supplied payload.
  const [users] = await pool.execute(
    `SELECT email
     FROM users
     WHERE user_id = ?
     LIMIT 1`,
    [event.user_id]
  );

  const recipient = users[0]?.email;

  // Email service must treat disabled email as an intentional skip.
  // When enabled, SMTP failures must throw so the worker can retry.
  await sendNotificationEmail({
    to: recipient,
    subject: payload.title,
    title: payload.title,
    message: payload.message,
  });
}

export async function processNotificationBatch() {
  const events = await claimNotificationBatch(10);

  for (const event of events) {
    try {
      await processNotification(event);
      await completeNotification(event.outbox_id);

      logger.info("Outbox notification processed", {
        outboxId: event.outbox_id,
        eventType: event.event_type,
      });
    } catch (error) {
      await retryNotification(
        event.outbox_id,
        Number(event.attempts),
        error
      );

      logger.error("Outbox notification delivery failed", {
        outboxId: event.outbox_id,
        eventType: event.event_type,
        attempts: Number(event.attempts),
        retryExhausted: Number(event.attempts) >= MAX_ATTEMPTS,
        message: error.message,
      });
    }
  }

  return events.length;
}

export async function runNotificationWorker() {
  await recoverStaleNotifications();

  let stopping = false;
  let running = false;

  const tick = async () => {
    if (stopping || running) return;

    running = true;

    try {
      await processNotificationBatch();
    } catch (error) {
      logger.error("Notification worker batch failed", {
        message: error.message,
      });
    } finally {
      running = false;
    }
  };

  await tick();

  const timer = setInterval(() => {
    void tick();
  }, 3000);

  return async function stopWorker() {
    stopping = true;
    clearInterval(timer);

    // Wait for the current batch to finish.
    while (running) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };
}