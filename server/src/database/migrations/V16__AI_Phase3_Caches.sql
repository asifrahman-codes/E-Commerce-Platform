-- =====================================================
-- V16__AI_Phase3_Caches.sql
-- Purpose: persistent cache for AI review summaries and AI semantic search
-- interpretation. Tables are additive and contain no customer PII.
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_product_review_summaries (
    product_id INT NOT NULL PRIMARY KEY,
    review_count INT NOT NULL DEFAULT 0,
    last_review_at DATETIME NULL,
    summary JSON NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_review_summary_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_semantic_search_cache (
    query_hash CHAR(64) NOT NULL,
    original_query VARCHAR(300) NOT NULL,
    interpreted_intent JSON NOT NULL,
    matched_filters JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    PRIMARY KEY (query_hash),
    INDEX idx_ai_search_cache_expires (expires_at)
);
