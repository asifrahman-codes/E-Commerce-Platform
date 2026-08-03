-- =====================================================
-- drop_all.sql
-- Drops the entire ecommerce_db database.
-- WARNING: this permanently deletes all existing data.
-- =====================================================

DROP DATABASE IF EXISTS ecommerce_db;

SELECT 'Database dropped.' AS status;
