-- =====================================================
-- run_views.sql
-- Runs all view files
-- Usage: mysql -u root -p < run_views.sql
-- =====================================================

USE ecommerce_db;

SOURCE vw_product_list.sql;
SOURCE vw_product_variants.sql;
SOURCE vw_customer_orders.sql;
SOURCE vw_order_details.sql;
SOURCE vw_inventory_summary.sql;
SOURCE vw_dashboard_stats.sql;
SOURCE vw_product_reviews.sql;
SOURCE vw_low_stock_products.sql;
SOURCE vw_best_selling_products.sql;
SOURCE vw_monthly_sales.sql;
SOURCE vw_coupon_usage.sql;
SOURCE vw_customer_summary.sql;

SELECT 'Views created successfully.' AS status;
