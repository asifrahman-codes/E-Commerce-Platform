CREATE TABLE orders (

    order_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    address_id INT NOT NULL,

    coupon_id INT NULL,

    order_number VARCHAR(50) NOT NULL,

    subtotal DECIMAL(10,2) NOT NULL,

    discount DECIMAL(10,2) DEFAULT 0.00,

    shipping DECIMAL(10,2) DEFAULT 0.00,

    tax DECIMAL(10,2) DEFAULT 0.00,

    total DECIMAL(10,2) NOT NULL,

    status ENUM(
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED'
    ) DEFAULT 'PENDING',

    payment_status ENUM(
        'PENDING',
        'PAID',
        'FAILED',
        'REFUNDED'
    ) DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_orders_address
        FOREIGN KEY (address_id)
        REFERENCES addresses(address_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_orders_coupon
        FOREIGN KEY (coupon_id)
        REFERENCES coupons(coupon_id)
        ON DELETE SET NULL,

    CONSTRAINT uq_orders_order_number
        UNIQUE (order_number)

);

CREATE INDEX idx_orders_user
ON orders(user_id);

CREATE INDEX idx_orders_status
ON orders(status);

CREATE INDEX idx_orders_payment_status
ON orders(payment_status);

CREATE INDEX idx_orders_created_at
ON orders(created_at);