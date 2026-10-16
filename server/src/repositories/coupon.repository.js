import { pool } from "../database/index.js";

export async function createCoupon(connection, data) {
    const [result] = await connection.execute(
        `INSERT INTO coupons (
            code,
            description,
            discount_type,
            discount_value,
            min_order_amount,
            max_discount_amount,
            usage_limit,
            per_user_limit,
            starts_at,
            expires_at,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.code,
            data.description ?? null,
            data.discount_type,
            data.discount_value,
            data.min_order_amount ?? 0,
            data.max_discount_amount ?? null,
            data.usage_limit ?? null,
            data.per_user_limit ?? 1,
            data.starts_at,
            data.expires_at,
            data.status ?? "ACTIVE"
        ]
    );

    return result.insertId;
}

export async function findCouponById(couponId) {
    const [rows] = await pool.execute(
        `SELECT *
         FROM coupons
         WHERE coupon_id = ?`,
        [couponId]
    );

    return rows[0] ?? null;
}

export async function findCouponByCode(code) {
    const [rows] = await pool.execute(
        `SELECT *
         FROM coupons
         WHERE code = ?`,
        [code]
    );

    return rows[0] ?? null;
}

export async function findCouponByCodeForUpdate(connection, code) {
    const [rows] = await connection.execute(
        `SELECT *
         FROM coupons
         WHERE code = ?
         FOR UPDATE`,
        [code]
    );

    return rows[0] ?? null;
}

export async function findCouponByIdForUpdate(connection, couponId) {
    const [rows] = await connection.execute(
        `SELECT *
         FROM coupons
         WHERE coupon_id = ?
         FOR UPDATE`,
        [couponId]
    );

    return rows[0] ?? null;
}

export async function listCoupons() {
    const [rows] = await pool.execute(
        `SELECT
            c.*,
            (
                SELECT COUNT(*)
                FROM coupon_usages cu
                WHERE cu.coupon_id = c.coupon_id
                  AND cu.status = 'USED'
            ) AS used_count
         FROM coupons c
         ORDER BY c.created_at DESC`
    );

    return rows;
}

export async function updateCoupon(connection, couponId, data) {
    const fields = {
        description: "description",
        discount_type: "discount_type",
        discount_value: "discount_value",
        min_order_amount: "min_order_amount",
        max_discount_amount: "max_discount_amount",
        usage_limit: "usage_limit",
        per_user_limit: "per_user_limit",
        starts_at: "starts_at",
        expires_at: "expires_at",
        status: "status"
    };

    const columns = [];
    const values = [];

    for (const [key, column] of Object.entries(fields)) {
        if (Object.hasOwn(data, key)) {
            columns.push(`${column} = ?`);
            values.push(data[key]);
        }
    }

    if (columns.length === 0) {
        return false;
    }

    values.push(couponId);

    const [result] = await connection.execute(
        `UPDATE coupons
         SET ${columns.join(", ")}
         WHERE coupon_id = ?`,
        values
    );

    return result.affectedRows > 0;
}

export async function countCouponUsages(connection, couponId) {
    const [rows] = await connection.execute(
        `SELECT COUNT(*) AS usage_count
         FROM coupon_usages
         WHERE coupon_id = ?
           AND status = 'USED'`,
        [couponId]
    );

    return Number(rows[0].usage_count);
}

export async function countUserCouponUsages(
    connection,
    couponId,
    userId
) {
    const [rows] = await connection.execute(
        `SELECT COUNT(*) AS usage_count
         FROM coupon_usages
         WHERE coupon_id = ?
           AND user_id = ?
           AND status = 'USED'`,
        [couponId, userId]
    );

    return Number(rows[0].usage_count);
}

export async function createCouponUsage(
    connection,
    { couponId, userId, orderId, discountAmount }
) {
    const [result] = await connection.execute(
        `INSERT INTO coupon_usages (
            coupon_id,
            user_id,
            order_id,
            discount_amount,
            status
        )
        VALUES (?, ?, ?, ?, 'USED')`,
        [couponId, userId, orderId, discountAmount]
    );

    return result.insertId;
}

export async function releaseCouponUsage(connection, orderId) {
    const [result] = await connection.execute(
        `UPDATE coupon_usages
         SET status = 'RELEASED',
             released_at = CURRENT_TIMESTAMP
         WHERE order_id = ?
           AND status = 'USED'`,
        [orderId]
    );

    return result.affectedRows;
}