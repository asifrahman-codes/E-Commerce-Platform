
import { pool } from "../database/index.js";

function buildFilters(filters) {
  const conditions = ["p.status = 'ACTIVE'"];
  const params = [];

  if (filters.q) {
    const term = `%${filters.q}%`;

    conditions.push(`
      (
        p.name LIKE ?
        OR p.description LIKE ?
        OR p.slug LIKE ?
      )
    `);

    params.push(term, term, term);
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
    conditions.push(
      "COALESCE(vs.min_price, p.base_price) >= ?"
    );
    params.push(filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(
      "COALESCE(vs.min_price, p.base_price) <= ?"
    );
    params.push(filters.maxPrice);
  }

  if (filters.inStock === true) {
    conditions.push("COALESCE(vs.total_stock, 0) > 0");
  } else if (filters.inStock === false) {
    conditions.push("COALESCE(vs.total_stock, 0) <= 0");
  }

  return {
    whereClause: `WHERE ${conditions.join(" AND ")}`,
    params,
  };
}

const SORT_OPTIONS = {
  newest: "p.created_at DESC, p.product_id DESC",
  oldest: "p.created_at ASC, p.product_id ASC",
  name_asc: "p.name ASC, p.product_id ASC",
  name_desc: "p.name DESC, p.product_id DESC",
  price_asc: "COALESCE(vs.min_price, p.base_price) ASC, p.product_id ASC",
  price_desc: "COALESCE(vs.min_price, p.base_price) DESC, p.product_id DESC",
  rating_desc: "COALESCE(rs.average_rating, 0) DESC, p.product_id DESC",
  rating_asc: "COALESCE(rs.average_rating, 0) ASC, p.product_id ASC",
};

const PRODUCT_JOINS = `
  LEFT JOIN categories c
    ON c.category_id = p.category_id

  LEFT JOIN brands b
    ON b.brand_id = p.brand_id

  LEFT JOIN (
    SELECT
      pv.product_id,
      MIN(
        CASE
          WHEN pv.status = 'ACTIVE'
          THEN COALESCE(pv.price, p2.base_price)
          ELSE NULL
        END
      ) AS min_price,
      SUM(
        CASE
          WHEN pv.status = 'ACTIVE'
          THEN pv.stock
          ELSE 0
        END
      ) AS total_stock
    FROM product_variants pv
    INNER JOIN products p2
      ON p2.product_id = pv.product_id
    GROUP BY pv.product_id
  ) vs
    ON vs.product_id = p.product_id

  LEFT JOIN (
    SELECT
      product_id,
      COUNT(*) AS review_count,
      AVG(rating) AS average_rating
    FROM reviews
    WHERE status = 'APPROVED'
    GROUP BY product_id
  ) rs
    ON rs.product_id = p.product_id
`;

export async function searchProducts(filters) {
  const { whereClause, params } = buildFilters(filters);

  const countSql = `
    SELECT COUNT(*) AS total
    FROM products p
    ${PRODUCT_JOINS}
    ${whereClause}
  `;

  const [countRows] = await pool.execute(countSql, params);
  const total = Number(countRows[0].total);

  const orderBy = SORT_OPTIONS[filters.sort] || SORT_OPTIONS.newest;

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

      COALESCE(vs.min_price, p.base_price) AS display_price,
      COALESCE(vs.total_stock, 0) AS total_stock,

      CASE
        WHEN COALESCE(vs.total_stock, 0) > 0 THEN 1
        ELSE 0
      END AS in_stock,

      COALESCE(rs.review_count, 0) AS review_count,
      ROUND(COALESCE(rs.average_rating, 0), 2) AS average_rating

    FROM products p
    ${PRODUCT_JOINS}
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const [products] = await pool.execute(productsSql, [
    ...params,
    filters.limit,
    filters.offset,
  ]);

  return { products, total };
}
