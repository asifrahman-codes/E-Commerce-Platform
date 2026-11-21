CREATE TABLE IF NOT EXISTS notification_outbox (
    outbox_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_key VARCHAR(191) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    event_type VARCHAR(60) NOT NULL,
    payload JSON NOT NULL,
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')
        NOT NULL DEFAULT 'PENDING',
    attempts INT UNSIGNED NOT NULL DEFAULT 0,
    available_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    locked_at DATETIME NULL,
    last_error TEXT NULL,
    processed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT unique_outbox_event_key
        UNIQUE (event_key),
    INDEX idx_outbox_pending (status, available_at, outbox_id),
    INDEX idx_outbox_stale (status, locked_at)
);
