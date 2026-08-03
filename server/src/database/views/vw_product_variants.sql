-- =====================================================
-- vw_product_variants.sql
-- Full variant detail joined back to its parent product
-- =====================================================

USE ecommerce_db;

CREATE OR REPLACE VIEW vw_product_variants AS
SELECT
    pv.variant_id,
    pv.sku,
    pv.size,
    pv.color,
    pv.price,
    pv.stock_quantity,
    pv.reorder_level,
    pv.is_active AS variant_active,
    p.product_id,
    p.name AS product_name,
    p.slug AS product_slug,
    c.name AS category_name,
    b.name AS brand_name
FROM product_variants pv
JOIN products p ON pv.product_id = p.product_id
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN brands b ON p.brand_id = b.brand_id;
