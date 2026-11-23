CREATE TABLE IF NOT EXISTS product_bundles (
    bundle_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(1000),
    discount_type ENUM('PERCENTAGE','FIXED') NOT NULL DEFAULT 'PERCENTAGE',
    discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    starts_at TIMESTAMP NULL,
    ends_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_bundles_status_dates (status, starts_at, ends_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_bundle_items (
    bundle_item_id INT AUTO_INCREMENT PRIMARY KEY,
    bundle_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    CONSTRAINT fk_bundle_items_bundle FOREIGN KEY (bundle_id) REFERENCES product_bundles(bundle_id) ON DELETE CASCADE,
    CONSTRAINT fk_bundle_items_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_bundle_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE,
    UNIQUE KEY uq_bundle_product_variant (bundle_id, product_id, variant_id),
    INDEX idx_bundle_items_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS back_in_stock_subscriptions (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    email VARCHAR(255) NOT NULL,
    product_id INT NOT NULL,
    variant_id INT NULL,
    status ENUM('PENDING','NOTIFIED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notified_at TIMESTAMP NULL,
    CONSTRAINT fk_backstock_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_backstock_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_backstock_variant FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE,
    UNIQUE KEY uq_backstock_email_variant (email, product_id, variant_id),
    INDEX idx_backstock_lookup (status, variant_id, product_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS wishlist_shares (
    share_id INT AUTO_INCREMENT PRIMARY KEY,
    share_token CHAR(36) NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(150),
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlist_shares_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uq_wishlist_share_token (share_token),
    INDEX idx_wishlist_shares_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS wishlist_share_items (
    share_item_id INT AUTO_INCREMENT PRIMARY KEY,
    share_id INT NOT NULL,
    product_id INT NOT NULL,
    CONSTRAINT fk_wishlist_share_items_share FOREIGN KEY (share_id) REFERENCES wishlist_shares(share_id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_share_items_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY uq_wishlist_share_product (share_id, product_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS referral_codes (
    referral_code_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(32) NOT NULL,
    reward_points INT UNSIGNED NOT NULL DEFAULT 0,
    status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_referral_code_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uq_referral_code (code),
    INDEX idx_referral_code_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS referral_uses (
    referral_use_id INT AUTO_INCREMENT PRIMARY KEY,
    referral_code_id INT NOT NULL,
    referred_user_id INT NOT NULL,
    order_id INT NULL,
    status ENUM('PENDING','COMPLETED','REJECTED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    CONSTRAINT fk_referral_use_code FOREIGN KEY (referral_code_id) REFERENCES referral_codes(referral_code_id) ON DELETE CASCADE,
    CONSTRAINT fk_referral_use_user FOREIGN KEY (referred_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_referral_use_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL,
    UNIQUE KEY uq_referral_referred_user (referred_user_id),
    INDEX idx_referral_use_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS promotional_campaigns (
    campaign_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(1000),
    channel VARCHAR(50) NOT NULL DEFAULT 'STORE',
    discount_type ENUM('PERCENTAGE','FIXED') NOT NULL DEFAULT 'PERCENTAGE',
    discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    coupon_code VARCHAR(50) NULL,
    starts_at TIMESTAMP NULL,
    ends_at TIMESTAMP NULL,
    status ENUM('DRAFT','ACTIVE','PAUSED','ENDED') NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campaign_status_dates (status, starts_at, ends_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    subscriber_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    status ENUM('SUBSCRIBED','UNSUBSCRIBED') NOT NULL DEFAULT 'SUBSCRIBED',
    source VARCHAR(100),
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL,
    UNIQUE KEY uq_newsletter_email (email),
    INDEX idx_newsletter_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS store_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value JSON NOT NULL,
    updated_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_store_settings_user FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    request_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_user_created (user_id, created_at),
    INDEX idx_audit_created (created_at),
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;
