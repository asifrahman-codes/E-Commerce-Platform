-- =====================================================
-- trg_stock_validation.sql
-- Prevents cart items / order items from exceeding
-- available stock, and blocks negative stock quantities
-- =====================================================

USE ecommerce_db;

DELIMITER $$

CREATE TRIGGER trg_cart_items_stock_check
BEFORE INSERT ON cart_items
FOR EACH ROW
BEGIN
    DECLARE available_stock INT;

    SELECT stock_quantity INTO available_stock
    FROM product_variants
    WHERE variant_id = NEW.variant_id;

    IF NEW.quantity > available_stock THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Requested quantity exceeds available stock.';
    END IF;
END $$

CREATE TRIGGER trg_variant_stock_non_negative
BEFORE UPDATE ON product_variants
FOR EACH ROW
BEGIN
    IF NEW.stock_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock quantity cannot be negative.';
    END IF;
END $$

DELIMITER ;
