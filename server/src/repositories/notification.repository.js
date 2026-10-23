
import { pool } from "../database/index.js";

export async function findUserEmail(userId) {
  const [rows] = await pool.execute(
    `
      SELECT email
      FROM users
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId]
  );

  return rows[0]?.email ?? null;
}

export async function createNotification({
  userId,
  eventKey,
  type,
  title,
  message,
  data,
}) {
  if (eventKey) {
    const [result] = await pool.execute(
      `
        INSERT INTO notifications (
          user_id,
          event_key,
          type,
          title,
          message,
          data
        )
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          notification_id = LAST_INSERT_ID(notification_id)
      `,
      [
        userId,
        eventKey,
        type,
        title,
        message,
        data == null ? null : JSON.stringify(data),
      ]
    );

    return findNotificationById(result.insertId, userId);
  }

  const [result] = await pool.execute(
    `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      userId,
      type,
      title,
      message,
      data == null ? null : JSON.stringify(data),
    ]
  );

  return findNotificationById(result.insertId, userId);
}

export async function findNotificationById(
  notificationId,
  userId
) {
  const [rows] = await pool.execute(
    `
      SELECT
        notification_id,
        user_id,
        event_key,
        type,
        title,
        message,
        data,
        is_read,
        read_at,
        created_at
      FROM notifications
      WHERE notification_id = ?
        AND user_id = ?
      LIMIT 1
    `,
    [notificationId, userId]
  );

  return rows[0] ?? null;
}

export async function getNotifications(
  userId,
  { limit, offset, unreadOnly }
) {
  const unreadClause = unreadOnly ? "AND is_read = FALSE" : "";

  const [rows] = await pool.execute(
    `
      SELECT
        notification_id,
        type,
        title,
        message,
        data,
        is_read,
        read_at,
        created_at
      FROM notifications
      WHERE user_id = ?
        ${unreadClause}
      ORDER BY created_at DESC, notification_id DESC
      LIMIT ? OFFSET ?
    `,
    [userId, limit, offset]
  );

  return rows;
}

export async function countNotifications(userId, unreadOnly = false) {
  const unreadClause = unreadOnly ? "AND is_read = FALSE" : "";

  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS total
      FROM notifications
      WHERE user_id = ?
        ${unreadClause}
    `,
    [userId]
  );

  return Number(rows[0].total);
}

export async function countUnreadNotifications(userId) {
  return countNotifications(userId, true);
}

export async function markNotificationAsRead(
  notificationId,
  userId
) {
  const [result] = await pool.execute(
    `
      UPDATE notifications
      SET
        is_read = TRUE,
        read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
      WHERE notification_id = ?
        AND user_id = ?
    `,
    [notificationId, userId]
  );

  return result.affectedRows > 0;
}

export async function markAllNotificationsAsRead(userId) {
  const [result] = await pool.execute(
    `
      UPDATE notifications
      SET
        is_read = TRUE,
        read_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
        AND is_read = FALSE
    `,
    [userId]
  );

  return result.affectedRows;
}

export async function deleteNotification(notificationId, userId) {
  const [result] = await pool.execute(
    `
      DELETE FROM notifications
      WHERE notification_id = ?
        AND user_id = ?
    `,
    [notificationId, userId]
  );

  return result.affectedRows > 0;
}

export async function clearNotifications(userId) {
  const [result] = await pool.execute(
    `
      DELETE FROM notifications
      WHERE user_id = ?
    `,
    [userId]
  );

  return result.affectedRows;
}
