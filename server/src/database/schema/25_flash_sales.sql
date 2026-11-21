CREATE TABLE flash_sales (
    flash_sale_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    description TEXT DEFAULT NULL,
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NOT NULL,
    discount_type ENUM('PERCENTAGE', 'FIXED') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_flash_sale_admin
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT chk_flash_sale_dates CHECK (ends_at > starts_at),
    CONSTRAINT chk_flash_sale_discount CHECK (discount_value > 0)
);

CREATE INDEX idx_flash_sales_window
    ON flash_sales(status, starts_at, ends_at);

CREATE TABLE flash_sale_targets (
    target_id INT AUTO_INCREMENT PRIMARY KEY,
    flash_sale_id INT NOT NULL,
    target_type ENUM('PRODUCT', 'VARIANT') NOT NULL,
    product_id INT NOT NULL,
    variant_id INT DEFAULT NULL,
    per_customer_limit INT UNSIGNED DEFAULT NULL,
    CONSTRAINT fk_flash_target_campaign
        FOREIGN KEY (flash_sale_id) REFERENCES flash_sales(flash_sale_id) ON DELETE CASCADE,
    CONSTRAINT fk_flash_target_product
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_flash_target_variant
        FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE,
    CONSTRAINT chk_flash_target_variant
        CHECK (
            (target_type = 'PRODUCT' AND variant_id IS NULL)
            OR (target_type = 'VARIANT' AND variant_id IS NOT NULL)
        )
);

CREATE INDEX idx_flash_targets_product
    ON flash_sale_targets(product_id, flash_sale_id);
CREATE INDEX idx_flash_targets_variant
    ON flash_sale_targets(variant_id, flash_sale_id);
CREATE INDEX idx_flash_targets_campaign
    ON flash_sale_targets(flash_sale_id, target_id);

CREATE TABLE flash_sale_redemptions (
    redemption_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    target_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_type ENUM('PERCENTAGE', 'FIXED') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    status ENUM('USED', 'RELEASED') NOT NULL DEFAULT 'USED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_at DATETIME DEFAULT NULL,
    CONSTRAINT uq_flash_sale_order_target UNIQUE (target_id, order_id),
    CONSTRAINT fk_flash_redemption_target
        FOREIGN KEY (target_id) REFERENCES flash_sale_targets(target_id) ON DELETE RESTRICT,
    CONSTRAINT fk_flash_redemption_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_flash_redemption_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

CREATE INDEX idx_flash_redemptions_customer
    ON flash_sale_redemptions(target_id, user_id, status);
