-- =====================================================
-- trg_updated_at.sql
-- Note: MySQL's ON UPDATE CURRENT_TIMESTAMP (already
-- declared on every *updated_at column in schema/) is
-- the preferred mechanism and needs no trigger.
-- The trigger below is provided only for tables/engines
-- where ON UPDATE CURRENT_TIMESTAMP is not desired and
-- explicit control is needed instead.
-- =====================================================

USE ecommerce_db;

DELIMITER $$

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END $$

DELIMITER ;
