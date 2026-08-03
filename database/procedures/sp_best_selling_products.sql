-- =====================================================
-- sp_best_selling_products.sql
-- Top N products by units sold
-- =====================================================

USE ecommerce_db;

DELIMITER $$

CREATE PROCEDURE sp_best_selling_products(IN p_limit INT)
BEGIN
    SELECT
        p.product_id,
        p.name AS product_name,
        SUM(oi.quantity) AS total_units_sold,
        SUM(oi.subtotal) AS total_revenue
    FROM order_items oi
    JOIN product_variants pv ON oi.variant_id = pv.variant_id
    JOIN products p ON pv.product_id = p.product_id
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.status NOT IN ('cancelled', 'refunded')
    GROUP BY p.product_id
    ORDER BY total_units_sold DESC
    LIMIT p_limit;
END $$

DELIMITER ;
