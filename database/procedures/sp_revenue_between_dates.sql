-- =====================================================
-- sp_revenue_between_dates.sql
-- Total revenue and order count within a date range
-- =====================================================

USE ecommerce_db;

DELIMITER $$

CREATE PROCEDURE sp_revenue_between_dates(IN p_start_date DATE, IN p_end_date DATE)
BEGIN
    SELECT
        COUNT(order_id) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COALESCE(AVG(total_amount), 0) AS avg_order_value
    FROM orders
    WHERE status NOT IN ('cancelled', 'refunded')
      AND DATE(created_at) BETWEEN p_start_date AND p_end_date;
END $$

DELIMITER ;
