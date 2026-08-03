-- =====================================================
-- 08_product_variants.sql
-- Seed data: product variants
-- =====================================================

USE ecommerce_db;

INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity, reorder_level, is_active) VALUES
(1, 'OXF-SHIRT-WHT-M', 'M', 'White', 4500.00, 25, 5, TRUE),
(1, 'OXF-SHIRT-WHT-L', 'L', 'White', 4500.00, 18, 5, TRUE),
(1, 'OXF-SHIRT-BLU-M', 'M', 'Blue', 4500.00, 4, 5, TRUE),
(2, 'CHINO-SLM-KHK-32', '32', 'Khaki', 3800.00, 30, 8, TRUE),
(2, 'CHINO-SLM-NVY-34', '34', 'Navy', 3800.00, 22, 8, TRUE),
(3, 'WRAP-DRS-RED-S', 'S', 'Red', 5200.00, 12, 4, TRUE),
(3, 'WRAP-DRS-RED-M', 'M', 'Red', 5200.00, 0, 4, TRUE),
(4, 'TRL-SNK-BLK-42', '42', 'Black', 6900.00, 15, 6, TRUE),
(4, 'TRL-SNK-GRY-43', '43', 'Grey', 6900.00, 9, 6, TRUE);
