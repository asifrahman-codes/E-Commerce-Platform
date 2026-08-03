-- =====================================================
-- 14_reviews.sql
-- Seed data: reviews
-- =====================================================

USE ecommerce_db;

INSERT INTO reviews (product_id, user_id, order_item_id, rating, title, comment, is_approved) VALUES
(1, 3, 1, 5, 'Great fit and fabric', 'The oxford shirt fits true to size and the fabric feels premium. Will buy more colors.', TRUE);
