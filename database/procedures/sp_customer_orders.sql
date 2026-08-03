-- =====================================================
-- sp_customer_orders.sql
-- Full order history for a single customer
-- =====================================================

USE ecommerce_db;

DELIMITER $$

CREATE PROCEDURE sp_customer_orders(IN p_user_id INT)
BEGIN
    SELECT
        o.order_id,
        o.order_number,
        o.status,
        o.total_amount,
        o.created_at AS order_date,
        COUNT(oi.order_item_id) AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.order_id
    WHERE o.user_id = p_user_id
    GROUP BY o.order_id
    ORDER BY o.created_at DESC;
END $$

DELIMITER ;
