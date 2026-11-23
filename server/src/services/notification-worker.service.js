import {
  claimNotificationBatch,
  completeNotification,
  retryNotification,
  recoverStaleNotifications,
} from "../repositories/notification-outbox.repository.js";
import {
  findUserEmail,
  upsertNotificationFromOutbox,
} from "../repositories/notification.repository.js";
import { sendNotificationEmail } from "./email.service.js";
import { notificationConfig } from "../config/notification.config.js";
import { logger } from "../utils/logger.js";
import { findRestockedSubscriptions, markBackInStockNotified } from "../repositories/platform.repository.js";

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
  await upsertNotificationFromOutbox({
    userId: event.user_id,
    eventKey: event.event_key,
    type: event.event_type,
    title: payload.title,
    message: payload.message,
    data: payload.data || {},
  });

  // Read the recipient from the database, not from a user-supplied payload.
  const recipient = await findUserEmail(event.user_id);

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
  if (!notificationConfig.enabled) return 0;

  const restocked = await findRestockedSubscriptions();
  for (const subscription of restocked) {
    try {
      await sendNotificationEmail({
        to: subscription.email,
        subject: `${subscription.product_name} is back in stock`,
        title: `${subscription.product_name} is back in stock`,
        message: "The product you subscribed to is available again. Visit ShopSphere to place your order.",
      });
      await markBackInStockNotified(subscription.subscription_id);
    } catch (error) {
      logger.error("Back-in-stock notification failed", {
        subscriptionId: subscription.subscription_id,
        message: error.message,
      });
    }
  }

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