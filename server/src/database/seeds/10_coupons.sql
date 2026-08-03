-- =====================================================
-- 10_coupons.sql
-- Seed data: coupons
-- =====================================================

USE ecommerce_db;

INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, usage_count, valid_from, valid_until, is_active) VALUES
('WELCOME10', '10% off for first-time customers', 'percentage', 10.00, 2000.00, 1000.00, 500, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE),
('FLAT500', 'Flat Rs.500 off orders above Rs.5000', 'fixed', 500.00, 5000.00, NULL, 200, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE);
