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
