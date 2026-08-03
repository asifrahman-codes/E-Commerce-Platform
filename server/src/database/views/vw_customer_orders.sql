-- =====================================================
-- vw_customer_orders.sql
-- Orders joined with customer info for admin dashboards
-- =====================================================

USE ecommerce_db;

CREATE OR REPLACE VIEW vw_customer_orders AS
SELECT
    o.order_id,
    o.order_number,
    o.status,
    o.total_amount,
    o.created_at AS order_date,
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
    u.email AS customer_email,
    p.payment_status
FROM orders o
JOIN users u ON o.user_id = u.user_id
LEFT JOIN payments p ON p.order_id = o.order_id;
