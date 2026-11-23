import { pool } from "../database/index.js";

const SORT_OPTIONS = {
  newest: "p.created_at DESC, p.product_id DESC",
  oldest: "p.created_at ASC, p.product_id ASC",
  name_asc: "p.name ASC, p.product_id ASC",
  name_desc: "p.name DESC, p.product_id DESC",
  price_asc: "display_price ASC, p.product_id ASC",
  price_desc: "display_price DESC, p.product_id DESC",
  rating_asc: "average_rating ASC, p.product_id ASC",
  rating_desc: "average_rating DESC, p.product_id DESC",
  popularity: "popularity DESC, p.product_id DESC",
  best_selling: "units_sold DESC, p.product_id DESC",
};

const MIN_ACTIVE_PRICE = `(
  SELECT MIN(p.base_price + COALESCE(price_variant.price_adjustment, 0))
  FROM product_variants price_variant
  WHERE price_variant.product_id = p.product_id
    AND price_variant.status = 'ACTIVE'
)`;

const LITERAL_SEARCH_CONDITION = `(
  p.name LIKE ? ESCAPE '!'
  OR p.description LIKE ? ESCAPE '!'
  OR p.slug LIKE ? ESCAPE '!'
  OR b.name LIKE ? ESCAPE '!'
  OR EXISTS (
    SELECT 1
    FROM product_variants search_variant
    WHERE search_variant.product_id = p.product_id
      AND search_variant.sku LIKE ? ESCAPE '!'
  )
)`;

function escapeLikeValue(value) {
  return value.replace(/[!%_]/g, "!$&");
}

function buildFilters(filters = {}) {
  const conditions = ["p.status = 'ACTIVE'"];
  const params = [];

  if (filters.q) {
    const words = filters.q.match(/[\p{L}\p{N}]+/gu) ?? [];
    if (!words.length) {
      const likeTerm = `%${escapeLikeValue(filters.q)}%`;
      params.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);
      conditions.push(LITERAL_SEARCH_CONDITION);
    } else {
      const searchConditions = words.map((word) => {
        const likeTerm = `%${escapeLikeValue(word)}%`;
        params.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);
        return LITERAL_SEARCH_CONDITION;
      });

      conditions.push(`(${searchConditions.join(" AND ")})`);
    }
  }

  if (filters.categoryId !== undefined) {
    conditions.push("p.category_id = ?");
    params.push(filters.categoryId);
  }

  if (filters.brandId !== undefined) {
    conditions.push("p.brand_id = ?");
    params.push(filters.brandId);
  }

  if (filters.minPrice !== undefined) {
    conditions.push(`COALESCE(${MIN_ACTIVE_PRICE}, p.base_price) >= ?`);
    params.push(filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(`COALESCE(${MIN_ACTIVE_PRICE}, p.base_price) <= ?`);
    params.push(filters.maxPrice);
  }

  if (filters.inStock === true) {
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM product_variants available_variant
        WHERE available_variant.product_id = p.product_id
          AND available_variant.status = 'ACTIVE'
          AND available_variant.stock > 0
      )
    `);
  } else if (filters.inStock === false) {
    conditions.push(`
      NOT EXISTS (
        SELECT 1
        FROM product_variants available_variant
        WHERE available_variant.product_id = p.product_id
          AND available_variant.status = 'ACTIVE'
          AND available_variant.stock > 0
      )
    `);
  }

  return {
    whereClause: `WHERE ${conditions.join(" AND ")}`,
    params,
  };
}

export async function searchProducts(filters = {}) {
  const { whereClause, params } = buildFilters(filters);
  const limit = Number(filters.limit ?? 12);
  const offset = Number(filters.offset ?? 0);

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 50) {
    throw new Error("Invalid product search limit");
  }

  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw new Error("Invalid product search offset");
  }

  const countSql = `
    SELECT COUNT(*) AS total
    FROM products p
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    ${whereClause}
  `;
  const [countRows] = await pool.execute(countSql, params);
  const total = Number(countRows[0]?.total ?? 0);

  if (offset >= total) {
    return { products: [], total };
  }

  const orderBy = SORT_OPTIONS[filters.sort] ?? SORT_OPTIONS.newest;
  const salesSelect = filters.sort === "popularity"
    ? `, (
        SELECT COALESCE(SUM(oi.quantity), 0)
        FROM product_variants sales_variant
        INNER JOIN order_items oi ON oi.variant_id = sales_variant.variant_id
        INNER JOIN orders o ON o.order_id = oi.order_id
        WHERE sales_variant.product_id = p.product_id
          AND o.status NOT IN ('CANCELLED', 'REFUNDED')
      ) AS popularity`
    : filters.sort === "best_selling"
      ? `, (
          SELECT COALESCE(SUM(oi.quantity), 0)
          FROM product_variants sales_variant
          INNER JOIN order_items oi ON oi.variant_id = sales_variant.variant_id
          INNER JOIN orders o ON o.order_id = oi.order_id
          WHERE sales_variant.product_id = p.product_id
            AND o.status = 'DELIVERED'
        ) AS units_sold`
      : "";
  const productsSql = `
    SELECT
      p.product_id,
      p.category_id,
      p.brand_id,
      p.name,
      p.slug,
      p.description,
      p.base_price,
      p.status,
      p.created_at,
      c.name AS category_name,
      b.name AS brand_name,
      (
        SELECT COUNT(*)
        FROM reviews r
        WHERE r.product_id = p.product_id
          AND r.status = 'APPROVED'
      ) AS review_count,
      ROUND(COALESCE((
        SELECT AVG(r.rating)
        FROM reviews r
        WHERE r.product_id = p.product_id
          AND r.status = 'APPROVED'
      ), 0), 2) AS average_rating,
      (
        SELECT pi.image_url
        FROM product_images pi
        WHERE pi.product_id = p.product_id
        ORDER BY pi.is_primary DESC, pi.image_id ASC
        LIMIT 1
      ) AS primary_image,
      COALESCE(${MIN_ACTIVE_PRICE}, p.base_price) AS display_price,
      (
        SELECT COALESCE(SUM(stock_variant.stock), 0)
        FROM product_variants stock_variant
        WHERE stock_variant.product_id = p.product_id
          AND stock_variant.status = 'ACTIVE'
      ) AS total_stock,
      CASE WHEN EXISTS (
        SELECT 1
        FROM product_variants available_variant
        WHERE available_variant.product_id = p.product_id
          AND available_variant.status = 'ACTIVE'
          AND available_variant.stock > 0
      ) THEN 1 ELSE 0 END AS in_stock
      ${salesSelect}
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const [products] = await pool.query(productsSql, [
    ...params,
    limit,
    offset,
  ]);

  return { products, total };
}
