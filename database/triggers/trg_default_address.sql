-- =====================================================
-- trg_default_address.sql
-- Ensures only one default address per user
-- =====================================================

USE ecommerce_db;

DELIMITER $$

CREATE TRIGGER trg_single_default_address
BEFORE INSERT ON addresses
FOR EACH ROW
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE addresses
        SET is_default = FALSE
        WHERE user_id = NEW.user_id;
    END IF;
END $$

CREATE TRIGGER trg_single_default_address_update
BEFORE UPDATE ON addresses
FOR EACH ROW
BEGIN
    IF NEW.is_default = TRUE AND OLD.is_default = FALSE THEN
        UPDATE addresses
        SET is_default = FALSE
        WHERE user_id = NEW.user_id AND address_id <> NEW.address_id;
    END IF;
END $$

DELIMITER ;
