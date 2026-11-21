CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_key VARCHAR(191) NULL,
    type VARCHAR(60) NOT NULL,
    title VARCHAR(180) NOT NULL,
    message TEXT NOT NULL,
    data JSON NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_notifications_event_key
        UNIQUE (event_key),
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    INDEX idx_notifications_user_created
        (user_id, created_at, notification_id),
    INDEX idx_notifications_user_unread
        (user_id, is_read, created_at)
);
