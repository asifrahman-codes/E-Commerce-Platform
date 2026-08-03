-- =====================================================
-- sp_product_rating_summary.sql
-- Average rating and review count for a given product
-- =====================================================

USE ecommerce_db;

DELIMITER $$

CREATE PROCEDURE sp_product_rating_summary(IN p_product_id INT)
BEGIN
    SELECT
        p.product_id,
        p.name AS product_name,
        COUNT(r.review_id) AS total_reviews,
        ROUND(AVG(r.rating), 2) AS average_rating,
        SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) AS five_star,
        SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) AS four_star,
        SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) AS three_star,
        SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) AS two_star,
        SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) AS one_star
    FROM products p
    LEFT JOIN reviews r ON r.product_id = p.product_id AND r.is_approved = TRUE
    WHERE p.product_id = p_product_id
    GROUP BY p.product_id;
END $$

DELIMITER ;
