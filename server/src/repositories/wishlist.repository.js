
import { pool } from "../database/index.js";

export async function findProductById(productId) {
  const [rows] = await pool.execute(
    `
      SELECT product_id
      FROM products
      WHERE product_id = ?
      LIMIT 1
    `,
    [productId]
  );

  return rows[0] ?? null;
}

export async function findWishlistItem(userId, productId) {
  const [rows] = await pool.execute(
    `
      SELECT wishlist_id, user_id, product_id, created_at
      FROM wishlists
      WHERE user_id = ?
        AND product_id = ?
      LIMIT 1
    `,
    [userId, productId]
  );

  return rows[0] ?? null;
}

export async function addWishlistItem(userId, productId) {
  const [result] = await pool.execute(
    `
      INSERT INTO wishlists (user_id, product_id)
      VALUES (?, ?)
    `,
    [userId, productId]
  );

  return findWishlistItem(userId, productId);
}

export async function getWishlistByUserId(userId) {
  const [rows] = await pool.execute(
    `
      SELECT
        w.wishlist_id,
        w.user_id,
        w.product_id,
        w.created_at,
        p.name AS product_name
      FROM wishlists w
      INNER JOIN products p
        ON p.product_id = w.product_id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC, w.wishlist_id DESC
    `,
    [userId]
  );

  return rows;
}

export async function removeWishlistItem(userId, productId) {
  const [result] = await pool.execute(
    `
      DELETE FROM wishlists
      WHERE user_id = ?
        AND product_id = ?
    `,
    [userId, productId]
  );

  return result.affectedRows > 0;
}

export async function clearWishlist(userId) {
  const [result] = await pool.execute(
    `
      DELETE FROM wishlists
      WHERE user_id = ?
    `,
    [userId]
  );

  return result.affectedRows;
}
