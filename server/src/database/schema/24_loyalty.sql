CREATE TABLE loyalty_settings (
    settings_id TINYINT PRIMARY KEY,
    points_per_currency DECIMAL(10,4) NOT NULL DEFAULT 0.0100,
    currency_per_point DECIMAL(10,4) NOT NULL DEFAULT 0.0100,
    minimum_redemption_points BIGINT UNSIGNED NOT NULL DEFAULT 100,
    expiry_days INT UNSIGNED DEFAULT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_loyalty_settings_singleton CHECK (settings_id = 1)
);

INSERT INTO loyalty_settings (
    settings_id, points_per_currency, currency_per_point, minimum_redemption_points
)
VALUES (1, 0.0100, 0.0100, 100);

CREATE TABLE loyalty_accounts (
    user_id INT PRIMARY KEY,
    balance BIGINT NOT NULL DEFAULT 0,
    lifetime_earned BIGINT UNSIGNED NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_loyalty_account_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE loyalty_transactions (
    transaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_id INT DEFAULT NULL,
    transaction_type ENUM(
        'EARN', 'REDEEM', 'REDEEM_RESTORE', 'REVERSAL', 'EXPIRY', 'ADJUSTMENT'
    ) NOT NULL,
    points_change BIGINT NOT NULL,
    currency_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    event_key VARCHAR(140) NOT NULL,
    notes VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_loyalty_event_key UNIQUE (event_key),
    CONSTRAINT fk_loyalty_transaction_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_loyalty_transaction_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL
);

CREATE INDEX idx_loyalty_transactions_user_created
    ON loyalty_transactions(user_id, created_at, transaction_id);
CREATE INDEX idx_loyalty_transactions_order
    ON loyalty_transactions(order_id, transaction_type);

CREATE TABLE loyalty_point_lots (
    lot_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    award_transaction_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    original_points BIGINT UNSIGNED NOT NULL,
    remaining_points BIGINT UNSIGNED NOT NULL,
    expires_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_loyalty_lot_award UNIQUE (award_transaction_id),
    CONSTRAINT fk_loyalty_lot_transaction
        FOREIGN KEY (award_transaction_id)
        REFERENCES loyalty_transactions(transaction_id) ON DELETE CASCADE,
    CONSTRAINT fk_loyalty_lot_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_loyalty_lots_user_expiry
    ON loyalty_point_lots(user_id, expires_at, remaining_points);

CREATE TABLE loyalty_redemption_allocations (
    redemption_transaction_id BIGINT NOT NULL,
    lot_id BIGINT NOT NULL,
    points_allocated BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (redemption_transaction_id, lot_id),
    CONSTRAINT fk_loyalty_allocation_transaction
        FOREIGN KEY (redemption_transaction_id)
        REFERENCES loyalty_transactions(transaction_id) ON DELETE CASCADE,
    CONSTRAINT fk_loyalty_allocation_lot
        FOREIGN KEY (lot_id) REFERENCES loyalty_point_lots(lot_id) ON DELETE CASCADE
);
