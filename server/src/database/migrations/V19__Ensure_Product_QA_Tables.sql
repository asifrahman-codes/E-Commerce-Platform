-- =====================================================
-- V19__Ensure_Product_QA_Tables.sql
-- Purpose: forward-safe ensure for live databases where V12
-- was not applied or the product Q&A schema is missing.
-- Additive only; existing data is preserved.
-- =====================================================

CREATE TABLE IF NOT EXISTS product_questions (
    question_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    status ENUM('PENDING','APPROVED','REJECTED','HIDDEN')
        NOT NULL DEFAULT 'PENDING',
    moderated_by INT NULL,
    moderated_at DATETIME NULL,
    moderation_reason VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_product_question_duplicate
        UNIQUE (product_id, user_id, question_hash),
    CONSTRAINT fk_product_question_product_v19
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_product_question_user_v19
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_product_question_moderator_v19
        FOREIGN KEY (moderated_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_answers (
    answer_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT UNSIGNED NOT NULL,
    answered_by INT NULL,
    answer_text TEXT NOT NULL,
    status ENUM('PENDING','APPROVED','REJECTED','HIDDEN')
        NOT NULL DEFAULT 'PENDING',
    moderated_by INT NULL,
    moderated_at DATETIME NULL,
    moderation_reason VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_product_answer_question_v19 UNIQUE (question_id),
    CONSTRAINT fk_product_answer_question_v19
        FOREIGN KEY (question_id) REFERENCES product_questions(question_id) ON DELETE CASCADE,
    CONSTRAINT fk_product_answer_author_v19
        FOREIGN KEY (answered_by) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_product_answer_moderator_v19
        FOREIGN KEY (moderated_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_answer_votes (
    answer_id BIGINT UNSIGNED NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (answer_id, user_id),
    CONSTRAINT fk_product_answer_vote_answer_v19
        FOREIGN KEY (answer_id) REFERENCES product_answers(answer_id) ON DELETE CASCADE,
    CONSTRAINT fk_product_answer_vote_user_v19
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Rollback is intentionally omitted. These tables may contain customer data.
-- Operator-approved rollback, only after confirming all three tables are empty:
-- DROP TABLE product_answer_votes;
-- DROP TABLE product_answers;
-- DROP TABLE product_questions;
