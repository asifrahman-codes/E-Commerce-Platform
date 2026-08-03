-- =====================================================
-- 02_users.sql
-- Seed data: users
-- Passwords below are placeholder bcrypt-style hashes
-- for demo purposes only.
-- =====================================================

USE ecommerce_db;

INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone, is_active, email_verified) VALUES
(1, 'Ayesha', 'Khan', 'ayesha.admin@example.com', '$2b$10$demoHashAdmin0000000000000000000000000000000000000', '+92-300-1234567', TRUE, TRUE),
(2, 'Bilal', 'Ahmed', 'bilal.staff@example.com', '$2b$10$demoHashStaff0000000000000000000000000000000000000', '+92-301-2345678', TRUE, TRUE),
(3, 'Sara', 'Malik', 'sara.malik@example.com', '$2b$10$demoHashCust10000000000000000000000000000000000000', '+92-302-3456789', TRUE, TRUE),
(3, 'Hamza', 'Riaz', 'hamza.riaz@example.com', '$2b$10$demoHashCust20000000000000000000000000000000000000', '+92-303-4567890', TRUE, FALSE),
(3, 'Zara', 'Iqbal', 'zara.iqbal@example.com', '$2b$10$demoHashCust30000000000000000000000000000000000000', '+92-304-5678901', TRUE, TRUE);
