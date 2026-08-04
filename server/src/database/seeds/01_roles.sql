-- =====================================================
-- 01_roles.sql
-- Seed data: roles
-- =====================================================

USE ecommerce_db;

INSERT INTO roles (name, description)
VALUES
('Admin', 'System Administrator'),
('Customer', 'Registered Customer');