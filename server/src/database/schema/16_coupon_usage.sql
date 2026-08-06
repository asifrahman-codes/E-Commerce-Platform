CREATE TABLE coupon_usages (

    usage_id INT AUTO_INCREMENT PRIMARY KEY,

    coupon_id INT NOT NULL,

    user_id INT NOT NULL,

    order_id INT NOT NULL,

    discount_amount DECIMAL(10,2) NOT NULL,

    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_coupon_usage_coupon
        FOREIGN KEY (coupon_id)
        REFERENCES coupons(coupon_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_coupon_usage_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_coupon_usage_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_coupon_usage_coupon
ON coupon_usages(coupon_id);

CREATE INDEX idx_coupon_usage_user
ON coupon_usages(user_id);

CREATE INDEX idx_coupon_usage_order
ON coupon_usages(order_id);