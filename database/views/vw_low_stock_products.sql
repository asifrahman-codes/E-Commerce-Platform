-- =====================================================
-- vw_low_stock_products.sql
-- Variants at or below their reorder level
-- =====================================================

USE ecommerce_db;

CREATE OR REPLACE VIEW vw_low_stock_products AS
SELECT
    pv.variant_id,
    pv.sku,
    p.name AS product_name,
    pv.size,
    pv.color,
    pv.stock_quantity,
    pv.reorder_level
FROM product_variants pv
JOIN products p ON pv.product_id = p.product_id
WHERE pv.stock_quantity <= pv.reorder_level
ORDER BY pv.stock_quantity ASC;
