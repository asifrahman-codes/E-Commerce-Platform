
import { pool } from "../database/index.js";

export async function findDeliveredPurchase(userId, productId) {
  const [rows] = await pool.execute(
    `
      SELECT o.order_id
      FROM orders o
      INNER JOIN order_items oi
        ON oi.order_id = o.order_id
      WHERE o.user_id = ?
        AND oi.product_id = ?
        AND o.status = 'DELIVERED'
      ORDER BY o.order_id DESC
      LIMIT 1
    `,
    [userId, productId]
  );

  return rows[0] ?? null;
}

export async function createReview(data) {
  const {
    productId,
    userId,
    orderId,
    rating,
    title,
    comment,
  } = data;

  const [result] = await pool.execute(
    `
      INSERT INTO reviews (
        product_id,
        user_id,
        order_id,
        rating,
        title,
        comment
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      productId,
      userId,
      orderId,
      rating,
      title,
      comment,
    ]
  );

  return findReviewById(result.insertId);
}

export async function findReviewById(reviewId) {
  const [rows] = await pool.execute(
    `
      SELECT
        r.review_id,
        r.product_id,
        r.user_id,
        r.order_id,
        r.rating,
        r.title,
        r.comment,
        r.status,
        r.created_at,
        r.updated_at,
        p.name AS product_name
      FROM reviews r
      INNER JOIN products p
        ON p.product_id = r.product_id
      WHERE r.review_id = ?
      LIMIT 1
    `,
    [reviewId]
  );

  return rows[0] ?? null;
}

export async function findUserReview(userId, reviewId) {
  const [rows] = await pool.execute(
    `
      SELECT *
      FROM reviews
      WHERE review_id = ?
        AND user_id = ?
      LIMIT 1
    `,
    [reviewId, userId]
  );

  return rows[0] ?? null;
}

export async function findUserProductReview(userId, productId) {
  const [rows] = await pool.execute(
    `
      SELECT *
      FROM reviews
      WHERE user_id = ?
        AND product_id = ?
      LIMIT 1
    `,
    [userId, productId]
  );

  return rows[0] ?? null;
}

export async function updateReview(reviewId, data) {
  const { rating, title, comment } = data;

  await pool.execute(
    `
      UPDATE reviews
      SET
        rating = ?,
        title = ?,
        comment = ?,
        status = 'PENDING',
        moderated_by = NULL,
        moderated_at = NULL,
        moderation_reason = NULL
      WHERE review_id = ?
    `,
    [rating, title, comment, reviewId]
  );

  return findReviewById(reviewId);
}

export async function deleteReview(reviewId) {
  const [result] = await pool.execute(
    "DELETE FROM reviews WHERE review_id = ?",
    [reviewId]
  );

  return result.affectedRows > 0;
}

export async function getProductRatingSummary(productId) {
  const [rows] = await pool.execute(
    `
      SELECT
        COUNT(*) AS total_reviews,
        ROUND(AVG(rating), 2) AS average_rating,
        SUM(rating = 5) AS five_star,
        SUM(rating = 4) AS four_star,
        SUM(rating = 3) AS three_star,
        SUM(rating = 2) AS two_star,
        SUM(rating = 1) AS one_star
      FROM reviews
      WHERE product_id = ?
        AND status = 'APPROVED'
    `,
    [productId]
  );

  const row = rows[0];

  return {
    total_reviews: Number(row.total_reviews || 0),
    average_rating: Number(row.average_rating || 0),
    distribution: {
      5: Number(row.five_star || 0),
      4: Number(row.four_star || 0),
      3: Number(row.three_star || 0),
      2: Number(row.two_star || 0),
      1: Number(row.one_star || 0),
    },
  };
}

export async function getApprovedProductReviews(
  productId,
  { limit = 10, offset = 0 } = {}
) {
  const safeProductId = Number(productId);
  const safeLimit = Number(limit);
  const safeOffset = Number(offset);

  if (!Number.isSafeInteger(safeProductId) || safeProductId <= 0) {
    throw new Error("Invalid product ID");
  }

  const finalLimit =
    Number.isInteger(safeLimit) && safeLimit > 0
      ? Math.min(safeLimit, 50)
      : 10;

  const finalOffset =
    Number.isSafeInteger(safeOffset) && safeOffset >= 0
      ? safeOffset
      : 0;

  const [rows] = await pool.execute(
    `
      SELECT
        r.review_id,
        r.product_id,
        r.rating,
        r.title,
        r.comment,
        r.created_at,
        u.user_id,
        CONCAT_WS(
          ' ',
          u.first_name,
          u.last_name
        ) AS reviewer_name
      FROM reviews r
      INNER JOIN users u
        ON u.user_id = r.user_id
      WHERE r.product_id = ?
        AND r.status = 'APPROVED'
      ORDER BY r.created_at DESC, r.review_id DESC
      LIMIT ${finalLimit} OFFSET ${finalOffset}
    `,
    [safeProductId]
  );

  return rows;
}

export async function getUserReviews(userId) {
  const [rows] = await pool.execute(
    `
      SELECT
        r.review_id,
        r.product_id,
        r.order_id,
        r.rating,
        r.title,
        r.comment,
        r.status,
        r.created_at,
        r.updated_at,
        p.name AS product_name
      FROM reviews r
      INNER JOIN products p
        ON p.product_id = r.product_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `,
    [userId]
  );

  return rows;
}

export async function getAdminReviews({
  status,
  limit,
  offset,
}) {
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push("r.status = ?");
    params.push(status);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const [rows] = await pool.execute(
    `
      SELECT
        r.review_id,
        r.product_id,
        r.user_id,
        r.order_id,
        r.rating,
        r.title,
        r.comment,
        r.status,
        r.created_at,
        r.updated_at,
        r.moderation_reason,
        p.name AS product_name,
        CONCAT_WS(' ', u.first_name, u.last_name) AS reviewer_name
      FROM reviews r
      INNER JOIN products p
        ON p.product_id = r.product_id
      INNER JOIN users u
        ON u.user_id = r.user_id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [...params, limit, offset]
  );

  return rows;
}

export async function moderateReview(
  reviewId,
  { status, adminId, reason }
) {
  const [result] = await pool.execute(
    `
      UPDATE reviews
      SET
        status = ?,
        moderated_by = ?,
        moderated_at = CURRENT_TIMESTAMP,
        moderation_reason = ?
      WHERE review_id = ?
    `,
    [status, adminId, reason, reviewId]
  );

  if (!result.affectedRows) {
    return null;
  }

  return findReviewById(reviewId);
}
