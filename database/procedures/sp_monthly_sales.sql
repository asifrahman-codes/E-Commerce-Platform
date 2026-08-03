-- =====================================================
-- sp_monthly_sales.sql
-- Monthly revenue/order totals for a given year
-- =====================================================

USE ecommerce_db;

DELIMITER $$

CREATE PROCEDURE sp_monthly_sales(IN p_year INT)
BEGIN
    SELECT
        DATE_FORMAT(o.created_at, '%Y-%m') AS sales_month,
        COUNT(DISTINCT o.order_id) AS total_orders,
        SUM(o.total_amount) AS total_revenue,
        AVG(o.total_amount) AS avg_order_value
    FROM orders o
    WHERE o.status NOT IN ('cancelled', 'refunded')
      AND YEAR(o.created_at) = p_year
    GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
    ORDER BY sales_month;
END $$

DELIMITER ;
