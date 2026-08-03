-- =====================================================
-- vw_customer_summary.sql
-- Per-customer lifetime order stats
-- =====================================================

USE ecommerce_db;

CREATE OR REPLACE VIEW vw_customer_summary AS
SELECT
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
    u.email,
    COUNT(o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS lifetime_spend,
    MAX(o.created_at) AS last_order_date
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id AND o.status NOT IN ('cancelled', 'refunded')
GROUP BY u.user_id;
