-- =====================================================
-- trg_order_status_history.sql
-- Automatically records order status transitions into
-- order_status_history whenever orders.status changes
-- =====================================================

USE ecommerce_db;

DELIMITER $$

CREATE TRIGGER trg_log_order_status_change
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status <> OLD.status THEN
        INSERT INTO order_status_history (order_id, status, notes)
        VALUES (NEW.order_id, NEW.status, CONCAT('Status changed from ', OLD.status, ' to ', NEW.status));
    END IF;
END $$

CREATE TRIGGER trg_initial_order_status_history
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    INSERT INTO order_status_history (order_id, status, notes)
    VALUES (NEW.order_id, NEW.status, 'Order created');
END $$

DELIMITER ;
