-- =====================================================
-- sp_low_stock_products.sql
-- Variants at or below a given stock threshold
-- (defaults to each variant's own reorder_level when
-- p_threshold is passed as NULL)
-- =====================================================

USE ecommerce_db;

DELIMITER $$

CREATE PROCEDURE sp_low_stock_products(IN p_threshold INT)
BEGIN
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
    WHERE pv.stock_quantity <= COALESCE(p_threshold, pv.reorder_level)
    ORDER BY pv.stock_quantity ASC;
END $$

DELIMITER ;
