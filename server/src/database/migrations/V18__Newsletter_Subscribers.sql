-- =====================================================
-- V18__Newsletter_Subscribers.sql
-- Purpose: forward-safe ensure newsletter_subscribers exists
-- when V15 was not applied or failed after earlier tables.
-- Additive only; never drops or resets existing subscriber data.
-- =====================================================

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

-- Rollback is intentionally omitted. This table may contain data.
-- Operator-approved rollback, only after confirming the table is empty:
-- DROP TABLE newsletter_subscribers;
