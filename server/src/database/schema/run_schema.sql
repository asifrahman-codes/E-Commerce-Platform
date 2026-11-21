-- =====================================================
-- Schema initialisation order (dependency-safe).
-- NOTE: file numbers do not match dependency order:
--   orders (18) must exist before order_items (17),
--   coupon_usage (16) and order_status_history (19).
-- 21_reviews.sql is a duplicate of 19_order_status_history.sql and
-- is intentionally NOT sourced; no real `reviews` table is defined here.
-- Run from the schema/ directory with the mysql client.
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
SOURCE ../schema/18_orders.sql;
SOURCE ../schema/17_order_items.sql;
SOURCE ../schema/16_coupon_usage.sql;
SOURCE ../schema/20_payments.sql;
SOURCE ../schema/19_order_status_history.sql;
SOURCE ../indexes/catalog_search_indexes.sql;
SOURCE ../schema/22_notifications.sql;
SOURCE ../schema/23_notification_outbox.sql;
SOURCE ../schema/24_loyalty.sql;
SOURCE ../schema/25_flash_sales.sql;
SOURCE ../schema/26_product_qa.sql;
SOURCE ../schema/27_support_tickets.sql;
SOURCE ../schema/28_token_version_sessions.sql;
