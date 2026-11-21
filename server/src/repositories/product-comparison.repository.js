import { pool } from "../database/index.js";

export async function getProductsForComparison(productIds) {
  const placeholders = productIds.map(() => "?").join(", ");
  const [products] = await pool.query(
    `
      SELECT
        p.product_id,
        p.name,
        p.slug,
        p.description,
        p.base_price,
        p.status,
        c.name AS category_name,
        b.name AS brand_name,
        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.product_id
          ORDER BY pi.is_primary DESC, pi.image_id ASC
          LIMIT 1
        ) AS primary_image
      FROM products p
      INNER JOIN categories c ON c.category_id = p.category_id
      INNER JOIN brands b ON b.brand_id = p.brand_id
      WHERE p.product_id IN (${placeholders})
        AND p.status = 'ACTIVE'
    `,
    productIds
  );

  if (!products.length) {
    return { products: [], variants: [] };
  }

  const foundProductIds = products.map((product) => product.product_id);
  const variantPlaceholders = foundProductIds.map(() => "?").join(", ");
  const [variants] = await pool.query(
    `
      SELECT
        pv.variant_id,
        pv.product_id,
        pv.sku,
        pv.size,
        pv.color,
        pv.price_adjustment,
        pv.stock,
        p.base_price + COALESCE(pv.price_adjustment, 0) AS final_price
      FROM product_variants pv
      INNER JOIN products p ON p.product_id = pv.product_id
      WHERE pv.product_id IN (${variantPlaceholders})
        AND pv.status = 'ACTIVE'
      ORDER BY pv.product_id, pv.variant_id
    `,
    foundProductIds
  );

  return { products, variants };
}
