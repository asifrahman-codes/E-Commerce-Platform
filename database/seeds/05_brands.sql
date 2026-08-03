-- =====================================================
-- 05_brands.sql
-- Seed data: brands
-- =====================================================

USE ecommerce_db;

INSERT INTO brands (name, slug, description, logo_url, is_active) VALUES
('Northline', 'northline', 'Everyday essentials with a minimalist design', '/uploads/brands/northline.png', TRUE),
('Urban Trail', 'urban-trail', 'Streetwear and casual footwear', '/uploads/brands/urban-trail.png', TRUE),
('Aurora Fits', 'aurora-fits', 'Women''s contemporary fashion', '/uploads/brands/aurora-fits.png', TRUE);
