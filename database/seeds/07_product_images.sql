-- =====================================================
-- 07_product_images.sql
-- Seed data: product images
-- =====================================================

USE ecommerce_db;

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES
(1, '/uploads/products/oxford-shirt-1.jpg', 'Classic Oxford Shirt front view', TRUE, 1),
(1, '/uploads/products/oxford-shirt-2.jpg', 'Classic Oxford Shirt back view', FALSE, 2),
(2, '/uploads/products/slim-chinos-1.jpg', 'Slim Fit Chinos front view', TRUE, 1),
(3, '/uploads/products/wrap-dress-1.jpg', 'Wrap Midi Dress front view', TRUE, 1),
(3, '/uploads/products/wrap-dress-2.jpg', 'Wrap Midi Dress side view', FALSE, 2),
(4, '/uploads/products/trail-sneakers-1.jpg', 'Trail Runner Sneakers side view', TRUE, 1);
