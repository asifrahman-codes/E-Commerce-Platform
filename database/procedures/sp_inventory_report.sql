-- =====================================================
-- sp_inventory_report.sql
-- Full inventory status report, optionally filtered by
-- category
-- =====================================================

USE ecommerce_db;

DELIMITER $$

CREATE PROCEDURE sp_inventory_report(IN p_category_id INT)
BEGIN
    SELECT
        pv.variant_id,
        pv.sku,
        p.name AS product_name,
        c.name AS category_name,
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
    JOIN products p ON pv.product_id = p.product_id
    JOIN categories c ON p.category_id = c.category_id
    WHERE p_category_id IS NULL OR p.category_id = p_category_id
    ORDER BY stock_status, pv.stock_quantity ASC;
END $$

DELIMITER ;
