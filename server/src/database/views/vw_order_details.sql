-- =====================================================
-- vw_order_details.sql
-- Full order breakdown including each line item
-- =====================================================

USE ecommerce_db;

CREATE OR REPLACE VIEW vw_order_details AS
SELECT
    o.order_id,
    o.order_number,
    o.status,
    o.subtotal,
    o.discount_amount,
    o.tax_amount,
    o.shipping_amount,
    o.total_amount,
    o.created_at AS order_date,
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
    oi.order_item_id,
    oi.product_name,
    oi.sku,
    oi.quantity,
    oi.unit_price,
    oi.subtotal AS line_subtotal
FROM orders o
JOIN users u ON o.user_id = u.user_id
JOIN order_items oi ON oi.order_id = o.order_id;
