-- =====================================================
-- vw_dashboard_stats.sql
-- High-level KPIs for the admin dashboard homepage
-- =====================================================

USE ecommerce_db;

CREATE OR REPLACE VIEW vw_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM users WHERE is_active = TRUE) AS active_users,
    (SELECT COUNT(*) FROM products WHERE is_active = TRUE) AS active_products,
    (SELECT COUNT(*) FROM orders) AS total_orders,
    (SELECT COUNT(*) FROM orders WHERE status = 'pending') AS pending_orders,
    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status NOT IN ('cancelled', 'refunded')) AS total_revenue,
    (SELECT COUNT(*) FROM product_variants WHERE stock_quantity = 0) AS out_of_stock_variants,
    (SELECT COUNT(*) FROM reviews WHERE is_approved = FALSE) AS pending_reviews;
