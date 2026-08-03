-- =====================================================
-- 09_inventory_transactions.sql
-- Seed data: inventory transactions
-- =====================================================

USE ecommerce_db;

INSERT INTO inventory_transactions (variant_id, transaction_type, quantity, reference_type, reference_id, notes, created_by) VALUES
(1, 'restock', 25, 'initial_stock', NULL, 'Initial warehouse stock load', 1),
(4, 'restock', 30, 'initial_stock', NULL, 'Initial warehouse stock load', 1),
(6, 'restock', 12, 'initial_stock', NULL, 'Initial warehouse stock load', 1),
(7, 'sale', 3, 'order', 1, 'Sold out during launch sale', 2);
