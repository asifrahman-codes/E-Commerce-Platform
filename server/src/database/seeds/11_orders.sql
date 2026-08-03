-- =====================================================
-- 11_orders.sql
-- Seed data: orders
-- =====================================================

USE ecommerce_db;

INSERT INTO orders (user_id, order_number, status, shipping_address_id, billing_address_id, subtotal, discount_amount, tax_amount, shipping_amount, total_amount, coupon_id, notes) VALUES
(3, 'ORD-2026-0001', 'delivered', 1, 1, 9000.00, 900.00, 0.00, 250.00, 8350.00, 1, 'Deliver in the evening if possible'),
(4, 'ORD-2026-0002', 'processing', 2, 2, 10400.00, 0.00, 0.00, 300.00, 10700.00, NULL, NULL);
