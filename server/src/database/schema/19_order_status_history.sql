CREATE TABLE order_status_history (

    history_id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    status ENUM(
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED'
    ) NOT NULL,

    changed_by INT NULL,

    notes VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_status_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_status_user
        FOREIGN KEY (changed_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL

);

CREATE INDEX idx_order_status_order
ON order_status_history(order_id);

CREATE INDEX idx_order_status_created
ON order_status_history(created_at);