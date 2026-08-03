-- =====================================================
-- 06_products.sql
-- Seed data: products
-- =====================================================

USE ecommerce_db;

INSERT INTO products (category_id, brand_id, name, slug, description, base_price, is_active) VALUES
(4, 1, 'Classic Oxford Shirt', 'classic-oxford-shirt', 'A tailored cotton oxford shirt suitable for work or casual wear.', 4500.00, TRUE),
(4, 1, 'Slim Fit Chinos', 'slim-fit-chinos', 'Comfortable stretch-cotton chinos with a modern slim fit.', 3800.00, TRUE),
(5, 3, 'Wrap Midi Dress', 'wrap-midi-dress', 'A flattering wrap dress in breathable viscose fabric.', 5200.00, TRUE),
(6, 2, 'Trail Runner Sneakers', 'trail-runner-sneakers', 'Lightweight sneakers built for daily wear and light trails.', 6900.00, TRUE);
