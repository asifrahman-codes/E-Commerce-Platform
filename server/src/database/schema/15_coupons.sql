CREATE TABLE coupons (

    coupon_id INT AUTO_INCREMENT PRIMARY KEY,

    code VARCHAR(50) NOT NULL,

    discount_type ENUM(
        'PERCENTAGE',
        'FIXED'
    ) NOT NULL,

    discount_value DECIMAL(10,2) NOT NULL,

    minimum_purchase DECIMAL(10,2) DEFAULT 0.00,

    max_discount DECIMAL(10,2) DEFAULT NULL,

    usage_limit INT DEFAULT NULL,

    used_count INT DEFAULT 0,

    expires_at DATETIME NOT NULL,

    status ENUM(
        'ACTIVE',
        'INACTIVE'
    ) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_coupon_code
        UNIQUE (code)

);

CREATE INDEX idx_coupon_code
ON coupons(code);

CREATE INDEX idx_coupon_status
ON coupons(status);

CREATE INDEX idx_coupon_expiry
ON coupons(expires_at);