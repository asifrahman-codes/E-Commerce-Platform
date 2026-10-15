-- =====================================================
-- sp_best_selling_products.sql
-- Top N products by units sold
-- =====================================================

USE ecommerce_db;

DELIMITER $$

CREATE PROCEDURE sp_best_selling_products(IN p_limit INT)
BEGIN
    -- Validate input
    IF p_limit IS NULL OR p_limit < 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Limit must be a positive integer';
    END IF;

    -- Retrieve best-selling products
    SELECT
        p.product_id,
        p.name AS product_name,
        SUM(oi.quantity) AS total_units_sold,
        SUM(oi.subtotal) AS total_revenue
    FROM order_items oi
    JOIN product_variants pv
        ON oi.variant_id = pv.variant_id
    JOIN products p
        ON pv.product_id = p.product_id
    JOIN orders o
        ON oi.order_id = o.order_id
    WHERE o.status NOT IN ('cancelled', 'refunded')
    GROUP BY p.product_id, p.name
    ORDER BY total_units_sold DESC
    LIMIT p_limit;
END $$

DELIMITER ;