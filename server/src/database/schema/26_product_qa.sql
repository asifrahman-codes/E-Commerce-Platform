CREATE TABLE product_questions (
    question_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN')
        NOT NULL DEFAULT 'PENDING',
    moderated_by INT DEFAULT NULL,
    moderated_at DATETIME DEFAULT NULL,
    moderation_reason VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_product_question_duplicate
        UNIQUE (product_id, user_id, question_hash),
    CONSTRAINT fk_product_question_product
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_product_question_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_product_question_moderator
        FOREIGN KEY (moderated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_product_questions_public
    ON product_questions(product_id, status, created_at, question_id);
CREATE INDEX idx_product_questions_user_created
    ON product_questions(user_id, created_at);

CREATE TABLE product_answers (
    answer_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT UNSIGNED NOT NULL,
    answered_by INT DEFAULT NULL,
    answer_text TEXT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN')
        NOT NULL DEFAULT 'PENDING',
    moderated_by INT DEFAULT NULL,
    moderated_at DATETIME DEFAULT NULL,
    moderation_reason VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_product_answer_question UNIQUE (question_id),
    CONSTRAINT fk_product_answer_question
        FOREIGN KEY (question_id) REFERENCES product_questions(question_id) ON DELETE CASCADE,
    CONSTRAINT fk_product_answer_author
        FOREIGN KEY (answered_by) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_product_answer_moderator
        FOREIGN KEY (moderated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_product_answers_status
    ON product_answers(status, question_id);

CREATE TABLE product_answer_votes (
    answer_id BIGINT UNSIGNED NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (answer_id, user_id),
    CONSTRAINT fk_product_answer_vote_answer
        FOREIGN KEY (answer_id) REFERENCES product_answers(answer_id) ON DELETE CASCADE,
    CONSTRAINT fk_product_answer_vote_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_product_answer_votes_user
    ON product_answer_votes(user_id, answer_id);
