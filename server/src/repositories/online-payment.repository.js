import {pool} from "../database/index.js";

export async function findOrderForUpdate(connection, orderId, userId) {
  const [rows] = await connection.execute(
    `SELECT
       order_id,
       user_id,
       order_number,
       total,
       status,
       payment_status
     FROM orders
     WHERE order_id = ? AND user_id = ?
     FOR UPDATE`,
    [orderId, userId]
  );

  return rows[0] ?? null;
}

export async function findAttemptForUpdate(connection, attemptId) {
  const [rows] = await connection.execute(
    `SELECT *
     FROM online_payment_attempts
     WHERE attempt_id = ?
     FOR UPDATE`,
    [attemptId]
  );

  return rows[0] ?? null;
}

export async function findActiveAttemptForOrder(
  connection,
  orderId,
  userId
) {
  const [rows] = await connection.execute(
    `SELECT *
     FROM online_payment_attempts
     WHERE order_id = ?
       AND user_id = ?
       AND status IN ('INITIATED', 'PENDING')
     ORDER BY attempt_id DESC
     LIMIT 1
     FOR UPDATE`,
    [orderId, userId]
  );

  return rows[0] ?? null;
}

export async function createAttempt(connection, data) {
  const [result] = await connection.execute(
    `INSERT INTO online_payment_attempts (
       order_id,
       user_id,
       provider,
       idempotency_key,
       amount,
       currency,
       status
     )
     VALUES (?, ?, ?, ?, ?, ?, 'INITIATED')`,
    [
      data.orderId,
      data.userId,
      data.provider,
      data.idempotencyKey,
      data.amount,
      data.currency,
    ]
  );

  return result.insertId;
}

export async function updateAttemptCheckout(
  attemptId,
  checkout
) {
  await pool.execute(
    `UPDATE online_payment_attempts
     SET gateway_reference = ?,
         checkout_url = ?,
         status = 'PENDING'
     WHERE attempt_id = ?
       AND status = 'INITIATED'`,
    [
      checkout.gatewayReference,
      checkout.checkoutUrl,
      attemptId,
    ]
  );
}

export async function markAttemptInitiationFailed(
  attemptId,
  reason
) {
  await pool.execute(
    `UPDATE online_payment_attempts
     SET status = 'FAILED',
         failure_reason = ?
     WHERE attempt_id = ?
       AND status = 'INITIATED'`,
    [String(reason).slice(0, 500), attemptId]
  );
}

export async function findAttemptByIdForUser(attemptId, userId) {
  const [rows] = await pool.execute(
    `SELECT
       attempt_id,
       order_id,
       provider,
       gateway_reference,
       checkout_url,
       amount,
       currency,
       status,
       failure_reason,
       created_at,
       updated_at,
       completed_at
     FROM online_payment_attempts
     WHERE attempt_id = ? AND user_id = ?`,
    [attemptId, userId]
  );

  return rows[0] ?? null;
}

export async function findAttemptsByUser(userId) {
  const [rows] = await pool.execute(
    `SELECT
       attempt_id,
       order_id,
       provider,
       gateway_reference,
       amount,
       currency,
       status,
       created_at,
       updated_at,
       completed_at
     FROM online_payment_attempts
     WHERE user_id = ?
     ORDER BY attempt_id DESC`,
    [userId]
  );

  return rows;
}

export async function findOrderAttempts(orderId, userId) {
  const [rows] = await pool.execute(
    `SELECT
       attempt_id,
       order_id,
       provider,
       gateway_reference,
       amount,
       currency,
       status,
       created_at,
       updated_at,
       completed_at
     FROM online_payment_attempts
     WHERE order_id = ? AND user_id = ?
     ORDER BY attempt_id DESC`,
    [orderId, userId]
  );

  return rows;
}