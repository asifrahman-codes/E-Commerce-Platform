-- =====================================================
-- 12_order_items.sql
-- Seed data: order items
-- =====================================================

USE ecommerce_db;

INSERT INTO order_items (order_id, variant_id, product_name, sku, quantity, unit_price, subtotal) VALUES
(1, 1, 'Classic Oxford Shirt', 'OXF-SHIRT-WHT-M', 2, 4500.00, 9000.00),
(2, 6, 'Wrap Midi Dress', 'WRAP-DRS-RED-S', 2, 5200.00, 10400.00);
