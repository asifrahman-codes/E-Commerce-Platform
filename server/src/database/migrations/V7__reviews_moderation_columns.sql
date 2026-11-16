-- =====================================================
-- V7__reviews_moderation_columns.sql
-- Purpose : review.repository.js writes moderated_by, moderated_at and
--           moderation_reason, which are absent from the `reviews` table
--           in the verified schema dump (MySQL 8.0.45, ecommerce_db).
-- Safety  : ADDITIVE ONLY. No column or table is dropped or altered in
--           type. Existing rows get NULL. Review before running on a live
--           database; take a backup first.
-- =====================================================

ALTER TABLE reviews
    ADD COLUMN moderated_by INT NULL AFTER status,
    ADD COLUMN moderated_at DATETIME NULL AFTER moderated_by,
    ADD COLUMN moderation_reason VARCHAR(255) NULL AFTER moderated_at,
    ADD CONSTRAINT fk_reviews_moderated_by
        FOREIGN KEY (moderated_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL;
