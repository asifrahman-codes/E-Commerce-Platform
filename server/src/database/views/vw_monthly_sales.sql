-- =====================================================
-- vw_monthly_sales.sql
-- Revenue and order counts grouped by month
-- =====================================================

USE ecommerce_db;

CREATE OR REPLACE VIEW vw_monthly_sales AS
SELECT
    DATE_FORMAT(o.created_at, '%Y-%m') AS sales_month,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(o.total_amount) AS total_revenue,
    AVG(o.total_amount) AS avg_order_value
FROM orders o
WHERE o.status NOT IN ('cancelled', 'refunded')
GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
ORDER BY sales_month DESC;
