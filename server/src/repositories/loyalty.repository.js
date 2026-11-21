import { pool } from "../database/index.js";

export async function getLoyaltySettings(connection = pool, forUpdate = false) {
    const [rows] = await connection.execute(
        `SELECT settings_id, points_per_currency, currency_per_point,
                minimum_redemption_points, expiry_days, status
         FROM loyalty_settings
         WHERE settings_id = 1${forUpdate ? " FOR UPDATE" : ""}`
    );
    return rows[0] ?? null;
}

export async function updateLoyaltySettings(connection, data) {
    const [result] = await connection.execute(
        `UPDATE loyalty_settings
         SET points_per_currency = ?,
             currency_per_point = ?,
             minimum_redemption_points = ?,
             expiry_days = ?,
             status = ?
         WHERE settings_id = 1`,
        [
            data.points_per_currency,
            data.currency_per_point,
            data.minimum_redemption_points,
            data.expiry_days ?? null,
            data.status ?? "ACTIVE"
        ]
    );
    return result.affectedRows > 0;
}

export async function ensureLoyaltyAccount(connection, userId, forUpdate = false) {
    await connection.execute(
        `INSERT IGNORE INTO loyalty_accounts (user_id) VALUES (?)`,
        [userId]
    );
    const [rows] = await connection.execute(
        `SELECT user_id, balance, lifetime_earned
         FROM loyalty_accounts
         WHERE user_id = ?${forUpdate ? " FOR UPDATE" : ""}`,
        [userId]
    );
    return rows[0] ?? null;
}

export async function findExpiredPointLots(connection, userId) {
    const [rows] = await connection.execute(
        `SELECT lot_id, award_transaction_id, remaining_points
         FROM loyalty_point_lots
         WHERE user_id = ?
           AND remaining_points > 0
           AND expires_at IS NOT NULL
           AND expires_at <= UTC_TIMESTAMP()
         ORDER BY expires_at, lot_id
         FOR UPDATE`,
        [userId]
    );
    return rows;
}

export async function expirePointLot(connection, lot) {
    const points = Number(lot.remaining_points);
    if (points <= 0) return 0;

    await connection.execute(
        `UPDATE loyalty_point_lots
         SET remaining_points = 0
         WHERE lot_id = ?`,
        [lot.lot_id]
    );
    await connection.execute(
        `UPDATE loyalty_accounts
         SET balance = balance - ?
         WHERE user_id = ?`,
        [points, lot.user_id]
    );
    await createLoyaltyTransaction(connection, {
        userId: lot.user_id,
        type: "EXPIRY",
        pointsChange: -points,
        eventKey: `expiry:${lot.lot_id}`,
        notes: "Unredeemed points expired"
    });
    return points;
}

export async function createLoyaltyTransaction(connection, {
    userId,
    orderId = null,
    type,
    pointsChange,
    currencyAmount = 0,
    eventKey,
    notes = null
}) {
    const [result] = await connection.execute(
        `INSERT INTO loyalty_transactions
            (user_id, order_id, transaction_type, points_change,
             currency_amount, event_key, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, orderId, type, pointsChange, currencyAmount, eventKey, notes]
    );
    return result.insertId;
}

export async function findLoyaltyTransactionByEvent(connection, eventKey) {
    const [rows] = await connection.execute(
        `SELECT transaction_id, points_change
         FROM loyalty_transactions
         WHERE event_key = ?
         LIMIT 1`,
        [eventKey]
    );
    return rows[0] ?? null;
}

export async function createPointLot(connection, {
    transactionId,
    userId,
    points,
    expiryDays = null
}) {
    const [result] = await connection.execute(
        `INSERT INTO loyalty_point_lots
            (award_transaction_id, user_id, original_points, remaining_points, expires_at)
         VALUES (?, ?, ?, ?,
            CASE WHEN ? IS NULL THEN NULL
                 ELSE DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? DAY)
            END)`,
        [transactionId, userId, points, points, expiryDays, expiryDays]
    );
    return result.insertId;
}

export async function findRedeemablePointLots(connection, userId) {
    const [rows] = await connection.execute(
        `SELECT lot_id, remaining_points
         FROM loyalty_point_lots
         WHERE user_id = ?
           AND remaining_points > 0
           AND (expires_at IS NULL OR expires_at > UTC_TIMESTAMP())
         ORDER BY expires_at IS NULL, expires_at, lot_id
         FOR UPDATE`,
        [userId]
    );
    return rows;
}

export async function reducePointLot(connection, lotId, points) {
    await connection.execute(
        `UPDATE loyalty_point_lots
         SET remaining_points = remaining_points - ?
         WHERE lot_id = ? AND remaining_points >= ?`,
        [points, lotId, points]
    );
}

export async function restorePointLot(connection, lotId, points) {
    await connection.execute(
        `UPDATE loyalty_point_lots
         SET remaining_points = remaining_points + ?
         WHERE lot_id = ?`,
        [points, lotId]
    );
}

export async function createRedemptionAllocation(
    connection,
    redemptionTransactionId,
    lotId,
    points
) {
    await connection.execute(
        `INSERT INTO loyalty_redemption_allocations
            (redemption_transaction_id, lot_id, points_allocated)
         VALUES (?, ?, ?)`,
        [redemptionTransactionId, lotId, points]
    );
}

export async function findRedemptionAllocations(connection, redemptionId) {
    const [rows] = await connection.execute(
        `SELECT a.lot_id, a.points_allocated, l.expires_at
         FROM loyalty_redemption_allocations a
         JOIN loyalty_point_lots l ON l.lot_id = a.lot_id
         WHERE a.redemption_transaction_id = ?
         ORDER BY a.lot_id
         FOR UPDATE`,
        [redemptionId]
    );
    return rows;
}

export async function updatePointLotRemaining(connection, lotId, points) {
    await connection.execute(
        `UPDATE loyalty_point_lots
         SET remaining_points = ?
         WHERE lot_id = ?`,
        [points, lotId]
    );
}

export async function adjustLoyaltyBalance(connection, userId, points, earned = false) {
    await connection.execute(
        `UPDATE loyalty_accounts
         SET balance = balance + ?,
             lifetime_earned = lifetime_earned + ?
         WHERE user_id = ?`,
        [points, earned ? points : 0, userId]
    );
}

export async function listLoyaltyTransactions(userId, limit, offset) {
    const [rows] = await pool.execute(
        `SELECT transaction_id, order_id, transaction_type, points_change,
                currency_amount, notes, created_at
         FROM loyalty_transactions
         WHERE user_id = ?
         ORDER BY created_at DESC, transaction_id DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
    );
    return rows;
}

export async function countLoyaltyTransactions(userId) {
    const [rows] = await pool.execute(
        `SELECT COUNT(*) AS total
         FROM loyalty_transactions
         WHERE user_id = ?`,
        [userId]
    );
    return Number(rows[0].total);
}

export async function findOrderForLoyaltyAward(connection, orderId) {
    const [rows] = await connection.execute(
        `SELECT order_id, user_id, subtotal, discount, status, payment_status
         FROM orders
         WHERE order_id = ?
         FOR UPDATE`,
        [orderId]
    );
    return rows[0] ?? null;
}

export async function findEarnedPointLotForOrder(connection, orderId, userId) {
    const [rows] = await connection.execute(
        `SELECT
            l.lot_id,
            l.remaining_points,
            l.original_points,
            t.transaction_id,
            COALESCE(-expired.points_change, 0) AS expired_points
         FROM loyalty_point_lots l
         JOIN loyalty_transactions t
           ON t.transaction_id = l.award_transaction_id
         LEFT JOIN loyalty_transactions expired
           ON expired.event_key = CONCAT('expiry:', l.lot_id)
         WHERE t.order_id = ?
           AND t.user_id = ?
           AND t.transaction_type = 'EARN'
         LIMIT 1
         FOR UPDATE`,
        [orderId, userId]
    );
    return rows[0] ?? null;
}

export async function findRedemptionForOrder(connection, orderId, userId) {
    const [rows] = await connection.execute(
        `SELECT transaction_id, points_change, currency_amount
         FROM loyalty_transactions
         WHERE order_id = ?
           AND user_id = ?
           AND transaction_type = 'REDEEM'
         LIMIT 1
         FOR UPDATE`,
        [orderId, userId]
    );
    return rows[0] ?? null;
}

export async function createRedemptionRestoreLot(connection, {
    transactionId,
    userId,
    points,
    expiryDays
}) {
    const [result] = await connection.execute(
        `INSERT INTO loyalty_point_lots
            (award_transaction_id, user_id, original_points, remaining_points, expires_at)
         VALUES (
            ?, ?, ?, ?,
            CASE WHEN ? IS NULL THEN NULL
                 ELSE DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? DAY)
            END
         )`,
        [transactionId, userId, points, points, expiryDays ?? null, expiryDays ?? null]
    );
    return result.insertId;
}
