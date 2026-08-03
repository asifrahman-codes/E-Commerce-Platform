-- =====================================================
-- vw_best_selling_products.sql
-- Products ranked by units sold across delivered orders
-- =====================================================

USE ecommerce_db;

CREATE OR REPLACE VIEW vw_best_selling_products AS
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
ORDER BY total_units_sold DESC;
