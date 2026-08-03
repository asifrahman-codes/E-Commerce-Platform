-- =====================================================
-- run_seeds.sql
-- Runs all seed files in dependency order
-- Usage: mysql -u root -p < run_seeds.sql
-- =====================================================

USE ecommerce_db;

SOURCE 01_roles.sql;
SOURCE 02_users.sql;
SOURCE 03_addresses.sql;
SOURCE 04_categories.sql;
SOURCE 05_brands.sql;
SOURCE 06_products.sql;
SOURCE 07_product_images.sql;
SOURCE 08_product_variants.sql;
SOURCE 09_inventory_transactions.sql;
SOURCE 10_coupons.sql;
SOURCE 11_orders.sql;
SOURCE 12_order_items.sql;
SOURCE 13_payments.sql;
SOURCE 14_reviews.sql;

SELECT 'Seed data inserted successfully.' AS status;
