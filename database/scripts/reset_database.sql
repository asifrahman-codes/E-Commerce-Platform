-- =====================================================
-- reset_database.sql
-- Drops and recreates the database, then re-runs setup.
-- WARNING: this permanently deletes all existing data.
--
-- Usage: mysql -u root -p < scripts/reset_database.sql
-- Run this from inside the database/ directory so the
-- relative SOURCE paths resolve correctly.
-- =====================================================

SOURCE scripts/drop_all.sql;
SOURCE scripts/setup_database.sql;

SELECT 'Database reset complete.' AS status;
