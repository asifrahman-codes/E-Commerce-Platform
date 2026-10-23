
import { Router } from "express";

import * as notificationController
  from "../controllers/notification.controller.js";

import authenticate from "../middleware/auth.middleware.js";

import {
  validateNotificationId,
  validateNotificationQuery,
} from "../validations/notification.validation.js";

const router = Router();

// Every notification endpoint requires an authenticated customer.
router.use(authenticate);

// List notifications with pagination and optional unread filter.
router.get(
  "/",
  validateNotificationQuery,
  notificationController.getMyNotifications
);

// Register fixed paths before parameterized paths.
router.get(
  "/unread-count",
  notificationController.getUnreadCount
);

router.patch(
  "/read-all",
  notificationController.markAllAsRead
);

router.delete(
  "/",
  notificationController.clearMyNotifications
);

// Read or delete one notification belonging to the current user.
router.patch(
  "/:notificationId/read",
  validateNotificationId,
  notificationController.markAsRead
);

router.delete(
  "/:notificationId",
  validateNotificationId,
  notificationController.deleteMyNotification
);

export default router;
