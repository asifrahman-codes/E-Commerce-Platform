-- =====================================================
-- vw_product_list.sql
-- Storefront-friendly product listing with category,
-- brand, primary image, and price range
-- =====================================================

USE ecommerce_db;

CREATE OR REPLACE VIEW vw_product_list AS
SELECT
    p.product_id,
    p.name          AS product_name,
    p.slug,
    p.base_price,
    c.category_id,
    c.name          AS category_name,
    b.brand_id,
    b.name          AS brand_name,
    pi.image_url    AS primary_image,
    MIN(pv.price)   AS min_price,
    MAX(pv.price)   AS max_price,
    SUM(pv.stock_quantity) AS total_stock,
    p.is_active,
    p.created_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN brands b ON p.brand_id = b.brand_id
LEFT JOIN product_images pi ON pi.product_id = p.product_id AND pi.is_primary = TRUE
LEFT JOIN product_variants pv ON pv.product_id = p.product_id
GROUP BY p.product_id, c.category_id, b.brand_id, pi.image_url;
