CREATE TABLE payments (

    payment_id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    transaction_id VARCHAR(255) NOT NULL,

    payment_gateway ENUM(
        'STRIPE',
        'PAYPAL',
        'COD'
    ) NOT NULL,

    payment_method VARCHAR(100),

    amount DECIMAL(10,2) NOT NULL,

    currency CHAR(3) DEFAULT 'USD',

    status ENUM(
        'PENDING',
        'SUCCEEDED',
        'FAILED',
        'CANCELLED',
        'REFUNDED'
    ) DEFAULT 'PENDING',

    paid_at DATETIME NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_payments_transaction
        UNIQUE (transaction_id)

);

CREATE INDEX idx_payments_order
ON payments(order_id);

CREATE INDEX idx_payments_status
ON payments(status);

CREATE INDEX idx_payments_gateway
ON payments(payment_gateway);