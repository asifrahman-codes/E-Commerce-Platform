import { pool } from "../database/index.js";

export async function enqueueNotification(
  connection,
  {
    eventKey,
    userId,
    eventType,
    payload,
  }
) {
  const [result] = await connection.execute(
    `INSERT INTO notification_outbox
      (event_key, user_id, event_type, payload)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       outbox_id = LAST_INSERT_ID(outbox_id)`,
    [
      eventKey,
      userId,
      eventType,
      JSON.stringify(payload),
    ]
  );

  return result.insertId;
}

export async function claimNotificationBatch(batchSize = 10) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Requires a MySQL version that supports SKIP LOCKED.
    const [rows] = await connection.query(
      `SELECT *
       FROM notification_outbox
       WHERE status = 'PENDING'
         AND available_at <= NOW()
       ORDER BY outbox_id ASC
       LIMIT ?
       FOR UPDATE SKIP LOCKED`,
      [batchSize]
    );

    const claimed = [];

    for (const row of rows) {
      await connection.execute(
        `UPDATE notification_outbox
         SET status = 'PROCESSING',
             locked_at = NOW(),
             attempts = attempts + 1
         WHERE outbox_id = ?`,
        [row.outbox_id]
      );

      claimed.push({
        ...row,
        attempts: Number(row.attempts) + 1,
      });
    }

    await connection.commit();
    return claimed;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function completeNotification(outboxId) {
  await pool.execute(
    `UPDATE notification_outbox
     SET status = 'COMPLETED',
         processed_at = NOW(),
         locked_at = NULL,
         last_error = NULL
     WHERE outbox_id = ?`,
    [outboxId]
  );
}

export async function retryNotification(
  outboxId,
  attempts,
  error
) {
  const maxAttempts = 8;
  const exhausted = attempts >= maxAttempts;

  // Exponential backoff, capped at 1 hour.
  const delaySeconds = Math.min(
    3600,
    5 * 2 ** Math.min(attempts - 1, 10)
  );

  const safeError = String(error?.message || "Unknown error")
    .slice(0, 2000);

  await pool.execute(
    `UPDATE notification_outbox
     SET status = ?,
         available_at = DATE_ADD(
           NOW(), INTERVAL ? SECOND
         ),
         locked_at = NULL,
         last_error = ?
     WHERE outbox_id = ?`,
    [
      exhausted ? "FAILED" : "PENDING",
      delaySeconds,
      safeError,
      outboxId,
    ]
  );
}

export async function recoverStaleNotifications() {
  // Recover records abandoned after a worker crash.
  // A long timeout avoids reclaiming normal slow deliveries.
  await pool.execute(
    `UPDATE notification_outbox
     SET status = 'PENDING',
         locked_at = NULL,
         available_at = NOW(),
         last_error = 'Recovered stale processing record'
     WHERE status = 'PROCESSING'
       AND locked_at < DATE_SUB(NOW(), INTERVAL 10 MINUTE)`
  );
}