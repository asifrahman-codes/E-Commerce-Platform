-- =====================================================
-- V1__Initial_Schema.sql
-- Migration: creates the database and all base tables.
-- Equivalent to running every file in schema/ in order.
-- =====================================================

SOURCE ../schema/01_database.sql;
SOURCE ../schema/02_roles.sql;
SOURCE ../schema/03_users.sql;
SOURCE ../schema/04_addresses.sql;
SOURCE ../schema/05_categories.sql;
SOURCE ../schema/06_brands.sql;
SOURCE ../schema/07_products.sql;
SOURCE ../schema/08_product_images.sql;
SOURCE ../schema/09_product_variants.sql;
SOURCE ../schema/10_inventory_transactions.sql;
SOURCE ../schema/11_carts.sql;
SOURCE ../schema/12_cart_items.sql;
SOURCE ../schema/13_wishlists.sql;
SOURCE ../schema/14_wishlist_items.sql;
SOURCE ../schema/15_coupons.sql;
SOURCE ../schema/16_coupon_usage.sql;
SOURCE ../schema/17_orders.sql;
SOURCE ../schema/18_order_items.sql;
SOURCE ../schema/19_payments.sql;
SOURCE ../schema/20_order_status_history.sql;
SOURCE ../schema/21_reviews.sql;

SOURCE ../constraints/unique_constraints.sql;
SOURCE ../constraints/check_constraints.sql;
