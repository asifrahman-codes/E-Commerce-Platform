-- =====================================================
-- setup_database.sql
-- One-shot setup: schema -> constraints -> indexes ->
-- triggers -> views -> procedures -> seed data
--
-- Usage: mysql -u root -p < scripts/setup_database.sql
-- Run this from inside the database/ directory so the
-- relative SOURCE paths resolve correctly.
-- =====================================================

SOURCE schema/run_schema.sql;
SOURCE constraints/unique_constraints.sql;
SOURCE constraints/check_constraints.sql;
SOURCE indexes/run_indexes.sql;
SOURCE triggers/run_triggers.sql;
SOURCE views/run_views.sql;
SOURCE procedures/run_procedures.sql;
SOURCE seeds/run_seeds.sql;

SELECT 'Database setup complete.' AS status;
