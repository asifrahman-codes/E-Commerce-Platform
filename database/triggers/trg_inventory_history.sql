-- =====================================================
-- trg_inventory_history.sql
-- Automatically logs every stock change to
-- inventory_transactions when product_variants.stock_quantity
-- is updated
-- =====================================================

USE ecommerce_db;

DELIMITER $$

CREATE TRIGGER trg_log_inventory_change
AFTER UPDATE ON product_variants
FOR EACH ROW
BEGIN
    IF NEW.stock_quantity <> OLD.stock_quantity THEN
        INSERT INTO inventory_transactions (
            variant_id, transaction_type, quantity, reference_type, notes
        )
        VALUES (
            NEW.variant_id,
            IF(NEW.stock_quantity > OLD.stock_quantity, 'restock', 'adjustment'),
            ABS(NEW.stock_quantity - OLD.stock_quantity),
            'auto_trigger',
            CONCAT('Stock changed from ', OLD.stock_quantity, ' to ', NEW.stock_quantity)
        );
    END IF;
END $$

DELIMITER ;
