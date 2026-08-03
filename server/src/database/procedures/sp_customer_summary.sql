-- =====================================================
-- sp_customer_summary.sql
-- Lifetime order stats for a single customer
-- =====================================================

USE ecommerce_db;

DELIMITER $$

CREATE PROCEDURE sp_customer_summary(IN p_user_id INT)
BEGIN
    SELECT
        u.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
        u.email,
        COUNT(o.order_id) AS total_orders,
        COALESCE(SUM(o.total_amount), 0) AS lifetime_spend,
        MAX(o.created_at) AS last_order_date
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.user_id AND o.status NOT IN ('cancelled', 'refunded')
    WHERE u.user_id = p_user_id
    GROUP BY u.user_id;
END $$

DELIMITER ;
