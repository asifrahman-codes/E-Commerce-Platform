-- =====================================================
-- vw_product_reviews.sql
-- Approved reviews joined with reviewer and product info
-- =====================================================

USE ecommerce_db;

CREATE OR REPLACE VIEW vw_product_reviews AS
SELECT
    r.review_id,
    r.product_id,
    p.name AS product_name,
    r.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS reviewer_name,
    r.rating,
    r.title,
    r.comment,
    r.is_approved,
    r.created_at
FROM reviews r
JOIN products p ON r.product_id = p.product_id
JOIN users u ON r.user_id = u.user_id;
