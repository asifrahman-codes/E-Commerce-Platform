import { pool } from "../database/index.js";

const PRODUCT_FIELDS = `
  p.product_id,
  p.category_id,
  p.brand_id,
  p.name,
  p.slug,
  p.description,
  p.base_price,
  p.created_at,
  c.name AS category_name,
  b.name AS brand_name,
  (
    SELECT image.image_url
    FROM product_images image
    WHERE image.product_id = p.product_id
    ORDER BY image.is_primary DESC, image.image_id ASC
    LIMIT 1
  ) AS primary_image,
  COALESCE((
    SELECT MIN(p.base_price + COALESCE(price_variant.price_adjustment, 0))
    FROM product_variants price_variant
    WHERE price_variant.product_id = p.product_id
      AND price_variant.status = 'ACTIVE'
  ), p.base_price) AS display_price,
  (
    SELECT COALESCE(SUM(stock_variant.stock), 0)
    FROM product_variants stock_variant
    WHERE stock_variant.product_id = p.product_id
      AND stock_variant.status = 'ACTIVE'
  ) AS total_stock
`;

const PRODUCT_JOINS = `
  FROM products p
  INNER JOIN categories c ON c.category_id = p.category_id
  INNER JOIN brands b ON b.brand_id = p.brand_id
`;

function availableProduct(productAlias) {
  return `
    ${productAlias}.status = 'ACTIVE'
    AND EXISTS (
      SELECT 1
      FROM product_variants available_variant
      WHERE available_variant.product_id = ${productAlias}.product_id
        AND available_variant.status = 'ACTIVE'
        AND available_variant.stock > 0
    )
  `;
}

const AVAILABLE_PRODUCT = availableProduct("p");

async function selectProducts(whereClause, params, limit, orderBy) {
  const [products] = await pool.query(
    `
      SELECT ${PRODUCT_FIELDS}
      ${PRODUCT_JOINS}
      WHERE ${AVAILABLE_PRODUCT}
        AND (${whereClause})
      ORDER BY ${orderBy}
      LIMIT ?
    `,
    [...params, limit]
  );
  return products;
}

async function getSalesRankedProducts(orderMetric, limit) {
  const outerOrderBy = orderMetric === "orders_count"
    ? "sales.orders_count DESC, sales.units_sold DESC"
    : "sales.units_sold DESC, sales.orders_count DESC";
  const innerOrderBy = orderMetric === "orders_count"
    ? "orders_count DESC, units_sold DESC"
    : "units_sold DESC, orders_count DESC";

  const [products] = await pool.query(
    `
      SELECT ${PRODUCT_FIELDS}
      ${PRODUCT_JOINS}
      INNER JOIN (
        SELECT
          variant.product_id,
          SUM(item.quantity) AS units_sold,
          COUNT(DISTINCT item.order_id) AS orders_count
        FROM order_items item
        INNER JOIN product_variants variant
          ON variant.variant_id = item.variant_id
        INNER JOIN products candidate
          ON candidate.product_id = variant.product_id
        INNER JOIN orders sales_order
          ON sales_order.order_id = item.order_id
        WHERE sales_order.status = 'DELIVERED'
          AND ${availableProduct("candidate")}
        GROUP BY variant.product_id
        ORDER BY ${innerOrderBy}, variant.product_id DESC
        LIMIT ?
      ) sales ON sales.product_id = p.product_id
      ORDER BY ${outerOrderBy}, p.product_id DESC
    `,
    [limit]
  );
  return products;
}

export async function getPopularProducts(limit) {
  return getSalesRankedProducts("orders_count", limit);
}

export async function getBestSellingProducts(limit) {
  return getSalesRankedProducts("units_sold", limit);
}

export async function getNewArrivalProducts(limit) {
  return selectProducts(
    "1 = 1",
    [],
    limit,
    "p.created_at DESC, p.product_id DESC"
  );
}

export async function getPersonalizedProducts(userId, limit) {
  const [products] = await pool.query(
    `
      SELECT ${PRODUCT_FIELDS}
      ${PRODUCT_JOINS}
      LEFT JOIN (
        SELECT
          preference_product.category_id,
          SUM(preference_item.quantity) AS purchase_weight
        FROM orders preference_order
        INNER JOIN order_items preference_item
          ON preference_item.order_id = preference_order.order_id
        INNER JOIN product_variants preference_variant
          ON preference_variant.variant_id = preference_item.variant_id
        INNER JOIN products preference_product
          ON preference_product.product_id = preference_variant.product_id
        WHERE preference_order.user_id = ?
          AND preference_order.status = 'DELIVERED'
        GROUP BY preference_product.category_id
      ) category_preferences
        ON category_preferences.category_id = p.category_id
      LEFT JOIN (
        SELECT
          preference_product.brand_id,
          SUM(preference_item.quantity) AS purchase_weight
        FROM orders preference_order
        INNER JOIN order_items preference_item
          ON preference_item.order_id = preference_order.order_id
        INNER JOIN product_variants preference_variant
          ON preference_variant.variant_id = preference_item.variant_id
        INNER JOIN products preference_product
          ON preference_product.product_id = preference_variant.product_id
        WHERE preference_order.user_id = ?
          AND preference_order.status = 'DELIVERED'
        GROUP BY preference_product.brand_id
      ) brand_preferences
        ON brand_preferences.brand_id = p.brand_id
      WHERE ${AVAILABLE_PRODUCT}
        AND (
          category_preferences.category_id IS NOT NULL
          OR brand_preferences.brand_id IS NOT NULL
        )
        AND NOT EXISTS (
          SELECT 1
          FROM orders purchased_order
          INNER JOIN order_items purchased_item
            ON purchased_item.order_id = purchased_order.order_id
          INNER JOIN product_variants purchased_variant
            ON purchased_variant.variant_id = purchased_item.variant_id
          WHERE purchased_order.user_id = ?
            AND purchased_order.status = 'DELIVERED'
            AND purchased_variant.product_id = p.product_id
        )
      ORDER BY
        (
          COALESCE(category_preferences.purchase_weight, 0) +
          COALESCE(brand_preferences.purchase_weight, 0)
        ) DESC,
        p.created_at DESC,
        p.product_id DESC
      LIMIT ?
    `,
    [userId, userId, userId, limit]
  );
  return products;
}

export async function getRelatedProducts(productId, limit) {
  const [sourceRows] = await pool.query(
    `
      SELECT category_id, brand_id
      FROM products
      WHERE product_id = ?
        AND status = 'ACTIVE'
      LIMIT 1
    `,
    [productId]
  );
  const source = sourceRows[0];
  if (!source) return null;

  const [related, similarByBrand] = await Promise.all([
    selectProducts(
      "p.category_id = ? AND p.product_id <> ?",
      [source.category_id, productId],
      limit,
      "p.created_at DESC, p.product_id DESC"
    ),
    selectProducts(
      "p.brand_id = ? AND p.product_id <> ?",
      [source.brand_id, productId],
      limit,
      "p.created_at DESC, p.product_id DESC"
    ),
  ]);

  return { related, similarByBrand };
}

export async function getFrequentlyBoughtTogetherProducts(
  productId,
  limit
) {
  const [products] = await pool.query(
    `
      SELECT
        ${PRODUCT_FIELDS},
        paired_orders.order_count AS together_order_count,
        paired_orders.quantity AS together_quantity
      ${PRODUCT_JOINS}
      INNER JOIN (
        SELECT
          target_variant.product_id,
          COUNT(DISTINCT target_order.order_id) AS order_count,
          SUM(target_item.quantity) AS quantity
        FROM orders target_order
        INNER JOIN order_items target_item
          ON target_item.order_id = target_order.order_id
        INNER JOIN product_variants target_variant
          ON target_variant.variant_id = target_item.variant_id
        WHERE target_order.status = 'DELIVERED'
          AND target_variant.product_id <> ?
          AND EXISTS (
            SELECT 1
            FROM order_items source_item
            INNER JOIN product_variants source_variant
              ON source_variant.variant_id = source_item.variant_id
            WHERE source_item.order_id = target_order.order_id
              AND source_variant.product_id = ?
          )
        GROUP BY target_variant.product_id
      ) paired_orders ON paired_orders.product_id = p.product_id
      WHERE ${AVAILABLE_PRODUCT}
      ORDER BY
        paired_orders.order_count DESC,
        paired_orders.quantity DESC,
        p.product_id DESC
      LIMIT ?
    `,
    [productId, productId, limit]
  );
  return products;
}

export async function getProductsByIds(productIds) {
  if (!productIds.length) return [];

  const placeholders = productIds.map(() => "?").join(", ");
  const [products] = await pool.query(
    `
      SELECT ${PRODUCT_FIELDS}
      ${PRODUCT_JOINS}
      WHERE ${AVAILABLE_PRODUCT}
        AND p.product_id IN (${placeholders})
      ORDER BY FIELD(p.product_id, ${placeholders})
    `,
    [...productIds, ...productIds]
  );
  return products;
}
