-- =====================================================
-- 13_payments.sql
-- Seed data: payments
-- =====================================================

USE ecommerce_db;

INSERT INTO payments (order_id, payment_method, payment_status, transaction_reference, amount, paid_at) VALUES
(1, 'credit_card', 'completed', 'TXN-CC-1001', 8350.00, '2026-06-15 10:32:00'),
(2, 'cash_on_delivery', 'pending', NULL, 10700.00, NULL);
