-- =====================================================
-- run_procedures.sql
-- Runs all stored procedure files
-- Usage: mysql -u root -p < run_procedures.sql
-- =====================================================

USE ecommerce_db;

SOURCE sp_dashboard_statistics.sql;
SOURCE sp_monthly_sales.sql;
SOURCE sp_best_selling_products.sql;
SOURCE sp_low_stock_products.sql;
SOURCE sp_customer_summary.sql;
SOURCE sp_inventory_report.sql;
SOURCE sp_product_rating_summary.sql;
SOURCE sp_customer_orders.sql;
SOURCE sp_revenue_between_dates.sql;

SELECT 'Procedures created successfully.' AS status;
