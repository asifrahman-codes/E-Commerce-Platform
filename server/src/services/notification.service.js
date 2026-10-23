
import * as notificationRepository
  from "../repositories/notification.repository.js";

import { sendNotificationEmail }
  from "./email.service.js";

import { notificationConfig }
  from "../config/notification.config.js";

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parsePositiveId(value, fieldName) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw createError(400, `Invalid ${fieldName}.`);
  }

  return id;
}

function parsePagination(query = {}) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 20 : Number(query.limit);

  if (!Number.isSafeInteger(page) || page < 1) {
    throw createError(400, "Page must be a positive integer.");
  }

  if (
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 50
  ) {
    throw createError(400, "Limit must be between 1 and 50.");
  }

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

function parseUnreadOnly(value) {
  if (value === undefined || value === "") {
    return false;
  }

  if (value === "true" || value === "1" || value === true) {
    return true;
  }

  if (value === "false" || value === "0" || value === false) {
    return false;
  }

  throw createError(400, "unread_only must be true or false.");
}

export async function createNotification(input) {
  if (!notificationConfig.enabled) {
    return null;
  }

  const userId = parsePositiveId(input.userId, "user ID");
  const type = String(input.type ?? "").trim();
  const title = String(input.title ?? "").trim();
  const message = String(input.message ?? "").trim();

  if (!/^[A-Z][A-Z0-9_]{1,59}$/.test(type)) {
    throw createError(400, "Invalid notification type.");
  }

  if (!title || title.length > 180) {
    throw createError(
      400,
      "Notification title is required and must be at most 180 characters."
    );
  }

  if (!message || message.length > 5000) {
    throw createError(
      400,
      "Notification message is required and must be at most 5000 characters."
    );
  }

  const eventKey = input.eventKey == null
    ? null
    : String(input.eventKey).trim();

  if (eventKey && eventKey.length > 191) {
    throw createError(400, "Event key is too long.");
  }

  // The database insert is the primary operation.
  // Email is deliberately best-effort.
  const notification =
    await notificationRepository.createNotification({
      userId,
      eventKey: eventKey || null,
      type,
      title,
      message,
      data: input.data ?? null,
    });

  if (input.sendEmail) {
    try {
      const recipient =
        input.email || await notificationRepository.findUserEmail(userId);

      await sendNotificationEmail({
        to: recipient,
        title,
        message,
      });
    } catch (error) {
      // Do not fail an order or shipment update just because
      // the optional email channel failed.
      console.error("Notification email delivery failed:", error.message);
    }
  }

  return notification;
}

export async function getMyNotifications(userId, query = {}) {
  const customerId = parsePositiveId(userId, "user ID");
  const pagination = parsePagination(query);
  const unreadOnly = parseUnreadOnly(query.unread_only);

  const [total, unreadCount, items] = await Promise.all([
    notificationRepository.countNotifications(
      customerId,
      unreadOnly
    ),
    notificationRepository.countUnreadNotifications(customerId),
    notificationRepository.getNotifications(customerId, {
      ...pagination,
      unreadOnly,
    }),
  ]);

  return {
    items,
    unread_count: unreadCount,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total_items: total,
      total_pages: Math.ceil(total / pagination.limit),
      has_next_page: pagination.page * pagination.limit < total,
      has_previous_page: pagination.page > 1,
    },
  };
}

export async function getUnreadCount(userId) {
  const customerId = parsePositiveId(userId, "user ID");

  return {
    unread_count:
      await notificationRepository.countUnreadNotifications(
        customerId
      ),
  };
}

export async function markAsRead(userId, notificationId) {
  const customerId = parsePositiveId(userId, "user ID");
  const id = parsePositiveId(notificationId, "notification ID");

  const updated =
    await notificationRepository.markNotificationAsRead(
      id,
      customerId
    );

  if (!updated) {
    throw createError(404, "Notification not found.");
  }

  return { message: "Notification marked as read." };
}

export async function markAllAsRead(userId) {
  const customerId = parsePositiveId(userId, "user ID");

  const updatedCount =
    await notificationRepository.markAllNotificationsAsRead(
      customerId
    );

  return {
    message: "All notifications marked as read.",
    updated_count: updatedCount,
  };
}

export async function deleteMyNotification(
  userId,
  notificationId
) {
  const customerId = parsePositiveId(userId, "user ID");
  const id = parsePositiveId(notificationId, "notification ID");

  const deleted =
    await notificationRepository.deleteNotification(
      id,
      customerId
    );

  if (!deleted) {
    throw createError(404, "Notification not found.");
  }

  return { message: "Notification deleted successfully." };
}

export async function clearMyNotifications(userId) {
  const customerId = parsePositiveId(userId, "user ID");

  const deletedCount =
    await notificationRepository.clearNotifications(customerId);

  return {
    message: "Notification history cleared.",
    deleted_count: deletedCount,
  };
}

// Event-specific helpers used by order and shipment workflows.

export async function notifyOrderConfirmed({
  userId,
  orderId,
  orderNumber,
}) {
  return createNotification({
    userId,
    eventKey: `order:${orderId}:confirmed`,
    type: "ORDER_CONFIRMED",
    title: "Order confirmed",
    message: `Your order ${orderNumber || orderId} has been confirmed.`,
    data: { order_id: orderId, order_number: orderNumber ?? null },
    sendEmail: true,
  });
}

export async function notifyOrderCancelled({
  userId,
  orderId,
  orderNumber,
}) {
  return createNotification({
    userId,
    eventKey: `order:${orderId}:cancelled`,
    type: "ORDER_CANCELLED",
    title: "Order cancelled",
    message: `Your order ${orderNumber || orderId} has been cancelled.`,
    data: { order_id: orderId, order_number: orderNumber ?? null },
    sendEmail: true,
  });
}

export async function notifyShipmentDispatched({
  userId,
  orderId,
  shipmentId,
  trackingNumber,
}) {
  return createNotification({
    userId,
    eventKey: `shipment:${shipmentId}:dispatched`,
    type: "SHIPMENT_DISPATCHED",
    title: "Your order has shipped",
    message: trackingNumber
      ? `Your order ${orderId} has shipped. Tracking number: ${trackingNumber}.`
      : `Your order ${orderId} has shipped.`,
    data: {
      order_id: orderId,
      shipment_id: shipmentId,
      tracking_number: trackingNumber ?? null,
    },
    sendEmail: true,
  });
}

export async function notifyShipmentInTransit({
  userId,
  shipmentId,
  trackingStatus,
}) {
  return createNotification({
    userId,
    eventKey: `shipment:${shipmentId}:in-transit:${trackingStatus}`,
    type: "SHIPMENT_IN_TRANSIT",
    title: "Shipment update",
    message: `Your shipment is now in transit. Status: ${trackingStatus}.`,
    data: {
      shipment_id: shipmentId,
      tracking_status: trackingStatus,
    },
    sendEmail: false,
  });
}

export async function notifyShipmentDelivered({
  userId,
  orderId,
  shipmentId,
}) {
  return createNotification({
    userId,
    eventKey: `shipment:${shipmentId}:delivered`,
    type: "SHIPMENT_DELIVERED",
    title: "Your order has been delivered",
    message: `Your shipment for order ${orderId} has been marked as delivered.`,
    data: {
      order_id: orderId,
      shipment_id: shipmentId,
    },
    sendEmail: true,
  });
}
