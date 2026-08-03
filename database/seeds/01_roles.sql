-- =====================================================
-- 01_roles.sql
-- Seed data: roles
-- =====================================================

USE ecommerce_db;

INSERT INTO roles (role_name, description) VALUES
('admin', 'Full access to manage the store'),
('staff', 'Limited access to manage orders and inventory'),
('customer', 'Shopper account with no admin access');
