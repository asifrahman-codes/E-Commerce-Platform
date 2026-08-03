-- =====================================================
-- 04_categories.sql
-- Seed data: categories
-- =====================================================

USE ecommerce_db;

INSERT INTO categories (parent_category_id, name, slug, description, is_active) VALUES
(NULL, 'Clothing', 'clothing', 'Apparel for men and women', TRUE),
(NULL, 'Footwear', 'footwear', 'Shoes, sandals, and boots', TRUE),
(NULL, 'Accessories', 'accessories', 'Bags, belts, and other add-ons', TRUE);

INSERT INTO categories (parent_category_id, name, slug, description, is_active) VALUES
(1, 'Men''s Clothing', 'mens-clothing', 'Shirts, trousers, and jackets for men', TRUE),
(1, 'Women''s Clothing', 'womens-clothing', 'Dresses, tops, and trousers for women', TRUE),
(2, 'Sneakers', 'sneakers', 'Casual and athletic sneakers', TRUE);
