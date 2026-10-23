
import * as notificationService from "../services/notification.service.js";

export async function getMyNotifications(req, res, next) {
  try {
    const data = await notificationService.getMyNotifications(
      req.user.user_id,
      req.query
    );

    return res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUnreadCount(req, res, next) {
  try {
    const data = await notificationService.getUnreadCount(
      req.user.user_id
    );

    return res.status(200).json({
      success: true,
      message: "Unread count retrieved successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const data = await notificationService.markAsRead(
      req.user.user_id,
      req.params.notificationId
    );

    return res.status(200).json({
      success: true,
      message: data.message,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    const data = await notificationService.markAllAsRead(
      req.user.user_id
    );

    return res.status(200).json({
      success: true,
      message: data.message,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMyNotification(req, res, next) {
  try {
    const data = await notificationService.deleteMyNotification(
      req.user.user_id,
      req.params.notificationId
    );

    return res.status(200).json({
      success: true,
      message: data.message,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function clearMyNotifications(req, res, next) {
  try {
    const data = await notificationService.clearMyNotifications(
      req.user.user_id
    );

    return res.status(200).json({
      success: true,
      message: data.message,
      data,
    });
  } catch (error) {
    next(error);
  }
}
