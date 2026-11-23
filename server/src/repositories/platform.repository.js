import crypto from "node:crypto";
import { pool } from "../database/index.js";
import withTransaction from "../utils/transaction.js";

export async function listActiveBundles() {
  const [rows] = await pool.execute(`
    SELECT b.*, COUNT(bi.bundle_item_id) AS item_count
    FROM product_bundles b
    LEFT JOIN product_bundle_items bi ON bi.bundle_id = b.bundle_id
    WHERE b.status = 'ACTIVE'
      AND (b.starts_at IS NULL OR b.starts_at <= NOW())
      AND (b.ends_at IS NULL OR b.ends_at >= NOW())
    GROUP BY b.bundle_id
    ORDER BY b.created_at DESC`);
  return rows;
}

export async function createBundle(data) {
  return withTransaction(async (connection) => {
    const [result] = await connection.execute(
      `INSERT INTO product_bundles (name, description, discount_type, discount_value, status, starts_at, ends_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.name, data.description ?? null, data.discount_type, data.discount_value, data.status ?? "ACTIVE", data.starts_at ?? null, data.ends_at ?? null]
    );
    for (const item of data.items ?? []) {
      await connection.execute(
        `INSERT INTO product_bundle_items (bundle_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)`,
        [result.insertId, item.product_id, item.variant_id ?? null, item.quantity ?? 1]
      );
    }
    return result.insertId;
  });
}

export async function subscribeBackInStock(data) {
  await pool.execute(
    `INSERT INTO back_in_stock_subscriptions (user_id, email, product_id, variant_id)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE status = IF(status = 'NOTIFIED', 'PENDING', status), created_at = NOW()`,
    [data.user_id ?? null, data.email, data.product_id, data.variant_id ?? null]
  );
}

export async function subscribeNewsletter(email, source) {
  await pool.execute(
    `INSERT INTO newsletter_subscribers (email, status, source)
     VALUES (?, 'SUBSCRIBED', ?)
     ON DUPLICATE KEY UPDATE status = 'SUBSCRIBED', unsubscribed_at = NULL, source = COALESCE(VALUES(source), source)`,
    [email, source ?? null]
  );
}

export async function unsubscribeNewsletter(email) {
  await pool.execute(
    `UPDATE newsletter_subscribers SET status = 'UNSUBSCRIBED', unsubscribed_at = NOW() WHERE email = ?`,
    [email]
  );
}

export async function createWishlistShare(userId, title, expiresAt) {
  const token = crypto.randomUUID();
  const [result] = await pool.execute(
    `INSERT INTO wishlist_shares (share_token, user_id, title, expires_at) VALUES (?, ?, ?, ?)`,
    [token, userId, title ?? null, expiresAt ?? null]
  );
  await pool.execute(
    `INSERT IGNORE INTO wishlist_share_items (share_id, product_id)
     SELECT ?, product_id FROM wishlists WHERE user_id = ?`,
    [result.insertId, userId]
  );
  return token;
}

export async function getWishlistShare(token) {
  const [shares] = await pool.execute(
    `SELECT share_id, share_token, title, expires_at, created_at
     FROM wishlist_shares
     WHERE share_token = ? AND (expires_at IS NULL OR expires_at >= NOW()) LIMIT 1`,
    [token]
  );
  if (!shares[0]) return null;
  const [items] = await pool.execute(
    `SELECT p.product_id, p.name, p.slug, p.base_price,
      (SELECT pi.image_url FROM product_images pi WHERE pi.product_id=p.product_id ORDER BY pi.is_primary DESC, pi.image_id LIMIT 1) AS primary_image_url
     FROM wishlist_share_items wsi
     JOIN products p ON p.product_id=wsi.product_id
     WHERE wsi.share_id=?`,
    [shares[0].share_id]
  );
  return { ...shares[0], items };
}

export async function createReferralCode(userId, code, rewardPoints) {
  await pool.execute(
    `INSERT INTO referral_codes (user_id, code, reward_points) VALUES (?, ?, ?)`,
    [userId, code, rewardPoints]
  );
  return code;
}

export async function applyReferralCode(code, referredUserId) {
  const [rows] = await pool.execute(
    `SELECT referral_code_id FROM referral_codes WHERE code=? AND status='ACTIVE' LIMIT 1`,
    [code]
  );
  if (!rows[0]) return null;
  await pool.execute(
    `INSERT IGNORE INTO referral_uses (referral_code_id, referred_user_id) VALUES (?, ?)`,
    [rows[0].referral_code_id, referredUserId]
  );
  return rows[0];
}

export async function listCampaigns() {
  const [rows] = await pool.execute(`SELECT * FROM promotional_campaigns ORDER BY created_at DESC`);
  return rows;
}

export async function createCampaign(data) {
  const [result] = await pool.execute(
    `INSERT INTO promotional_campaigns (name, description, channel, discount_type, discount_value, coupon_code, starts_at, ends_at, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.description ?? null, data.channel ?? "STORE", data.discount_type ?? "PERCENTAGE", data.discount_value ?? 0, data.coupon_code ?? null, data.starts_at ?? null, data.ends_at ?? null, data.status ?? "DRAFT"]
  );
  return result.insertId;
}

export async function getStoreSetting(key) {
  const [rows] = await pool.execute(`SELECT setting_key, setting_value FROM store_settings WHERE setting_key=?`, [key]);
  return rows[0] ?? null;
}

export async function setStoreSetting(key, value, userId) {
  await pool.execute(
    `INSERT INTO store_settings (setting_key, setting_value, updated_by) VALUES (?, CAST(? AS JSON), ?)
     ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value), updated_by=VALUES(updated_by)`,
    [key, JSON.stringify(value), userId]
  );
}

export async function listAuditLogs(limit = 100) {
  const [rows] = await pool.execute(
    `SELECT a.*, u.email AS actor_email FROM audit_logs a
     LEFT JOIN users u ON u.user_id=a.user_id
     ORDER BY a.created_at DESC LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function writeAuditLog(data) {
  await pool.execute(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, request_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.user_id ?? null, data.action, data.entity_type, data.entity_id ?? null,
      data.old_values ? JSON.stringify(data.old_values) : null,
      data.new_values ? JSON.stringify(data.new_values) : null,
      data.ip_address ?? null, data.user_agent ?? null, data.request_id ?? null]
  );
}

export async function getCustomerSegments() {
  const [rows] = await pool.execute(`
    SELECT
      SUM(CASE WHEN spend >= 10000 THEN 1 ELSE 0 END) AS vip,
      SUM(CASE WHEN spend < 10000 AND order_count > 0 THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN last_order_at IS NULL THEN 1 ELSE 0 END) AS prospects,
      SUM(CASE WHEN last_order_at IS NOT NULL AND last_order_at < DATE_SUB(NOW(), INTERVAL 90 DAY) THEN 1 ELSE 0 END) AS at_risk
    FROM (
      SELECT u.user_id, COALESCE(SUM(o.total),0) spend, COUNT(o.order_id) order_count, MAX(o.created_at) last_order_at
      FROM users u
      LEFT JOIN orders o ON o.user_id=u.user_id AND o.status <> 'CANCELLED'
      JOIN roles r ON r.role_id=u.role_id AND LOWER(r.name)= 'customer'
      GROUP BY u.user_id
    ) segments`);
  return rows[0];
}

export async function getInventoryForecast(days = 30) {
  const [rows] = await pool.execute(`
    SELECT pv.variant_id, pv.sku, p.product_id, p.name AS product_name, pv.stock,
      COALESCE(SUM(CASE WHEN it.transaction_type='SALE' AND it.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN -it.quantity_change ELSE 0 END),0) AS units_sold,
      CASE WHEN COALESCE(SUM(CASE WHEN it.transaction_type='SALE' AND it.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN -it.quantity_change ELSE 0 END),0)>0
        THEN CEILING(pv.stock / (SUM(CASE WHEN it.transaction_type='SALE' AND it.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN -it.quantity_change ELSE 0 END) / ?))
        ELSE NULL END AS estimated_days_remaining
    FROM product_variants pv
    JOIN products p ON p.product_id=pv.product_id
    LEFT JOIN inventory_transactions it ON it.variant_id=pv.variant_id
    WHERE pv.status='ACTIVE'
    GROUP BY pv.variant_id, pv.sku, p.product_id, p.name, pv.stock
    HAVING pv.stock < 20 OR units_sold > 0
    ORDER BY estimated_days_remaining ASC, pv.stock ASC
    LIMIT 200`,
    [days, days, days, days]
  );
  return rows;
}

export async function getSalesExport() {
  const [rows] = await pool.execute(`
    SELECT o.order_number, o.created_at, o.status, o.payment_status, o.subtotal, o.discount, o.shipping, o.tax, o.total, u.email
    FROM orders o JOIN users u ON u.user_id=o.user_id
    ORDER BY o.created_at DESC`);
  return rows;
}

export async function findRestockedSubscriptions(limit = 100) {
  const [rows] = await pool.execute(`
    SELECT s.subscription_id, s.email, s.product_id, s.variant_id, p.name AS product_name
    FROM back_in_stock_subscriptions s
    JOIN products p ON p.product_id=s.product_id
    LEFT JOIN product_variants pv ON pv.variant_id=s.variant_id
    WHERE s.status='PENDING'
      AND (
        (s.variant_id IS NULL AND EXISTS (
          SELECT 1 FROM product_variants av
          WHERE av.product_id=s.product_id AND av.status='ACTIVE' AND av.stock > 0
        ))
        OR (pv.status='ACTIVE' AND pv.stock > 0)
      )
    ORDER BY s.created_at ASC
    LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function markBackInStockNotified(subscriptionId) {
  await pool.execute(
    `UPDATE back_in_stock_subscriptions SET status='NOTIFIED', notified_at=NOW() WHERE subscription_id=? AND status='PENDING'`,
    [subscriptionId]
  );
}
