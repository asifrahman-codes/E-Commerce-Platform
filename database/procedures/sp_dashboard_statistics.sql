-- =====================================================
-- sp_dashboard_statistics.sql
-- Returns a single row of headline admin KPIs
-- =====================================================

USE ecommerce_db;

DELIMITER $$

CREATE PROCEDURE sp_dashboard_statistics()
BEGIN
    SELECT
        (SELECT COUNT(*) FROM users WHERE is_active = TRUE) AS active_users,
        (SELECT COUNT(*) FROM products WHERE is_active = TRUE) AS active_products,
        (SELECT COUNT(*) FROM orders) AS total_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') AS pending_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status NOT IN ('cancelled', 'refunded')) AS total_revenue,
        (SELECT COUNT(*) FROM product_variants WHERE stock_quantity = 0) AS out_of_stock_variants,
        (SELECT COUNT(*) FROM reviews WHERE is_approved = FALSE) AS pending_reviews;
END $$

DELIMITER ;
