-- =====================================================
-- run_triggers.sql
-- Runs all trigger files
-- Usage: mysql -u root -p < run_triggers.sql
-- =====================================================

USE ecommerce_db;

SOURCE trg_updated_at.sql;
SOURCE trg_stock_validation.sql;
SOURCE trg_inventory_history.sql;
SOURCE trg_order_status_history.sql;
SOURCE trg_default_address.sql;

SELECT 'Triggers created successfully.' AS status;
