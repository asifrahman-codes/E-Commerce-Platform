-- =====================================================
-- vw_inventory_summary.sql
-- Current stock position per variant
-- =====================================================

USE ecommerce_db;

CREATE OR REPLACE VIEW vw_inventory_summary AS
SELECT
    pv.variant_id,
    pv.sku,
    p.name AS product_name,
    pv.size,
    pv.color,
    pv.stock_quantity,
    pv.reorder_level,
    CASE
        WHEN pv.stock_quantity = 0 THEN 'Out of Stock'
        WHEN pv.stock_quantity <= pv.reorder_level THEN 'Low Stock'
        ELSE 'In Stock'
    END AS stock_status
FROM product_variants pv
JOIN products p ON pv.product_id = p.product_id;
