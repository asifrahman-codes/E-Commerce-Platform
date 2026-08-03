-- =====================================================
-- 03_addresses.sql
-- Seed data: addresses
-- =====================================================

USE ecommerce_db;

INSERT INTO addresses (user_id, address_type, address_line1, address_line2, city, state, postal_code, country, is_default) VALUES
(3, 'both', 'House 12, Street 5', 'F-7/2', 'Islamabad', 'Islamabad Capital Territory', '44000', 'Pakistan', TRUE),
(4, 'shipping', 'Flat 3B, Green Towers', 'DHA Phase 6', 'Karachi', 'Sindh', '75500', 'Pakistan', TRUE),
(5, 'both', '45 Mall Road', NULL, 'Lahore', 'Punjab', '54000', 'Pakistan', TRUE),
(5, 'billing', '12 Model Town', 'Block C', 'Lahore', 'Punjab', '54700', 'Pakistan', FALSE);
