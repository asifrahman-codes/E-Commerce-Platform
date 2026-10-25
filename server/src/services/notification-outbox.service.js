import {
  enqueueNotification,
} from "../repositories/notification-outbox.repository.js";

export async function queueNotification(
  connection,
  {
    eventKey,
    userId,
    type,
    title,
    message,
    data = {},
  }
) {
  if (!connection) {
    throw new Error(
      "A transaction connection is required to queue a notification."
    );
  }

  if (!eventKey || !userId || !type || !title || !message) {
    throw new Error("Required notification event fields are missing.");
  }

  return enqueueNotification(connection, {
    eventKey,
    userId,
    eventType: type,
    payload: {
      title,
      message,
      data,
    },
  });
}