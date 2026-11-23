CREATE TABLE IF NOT EXISTS semantic_product_embeddings (
    product_id INT NOT NULL PRIMARY KEY,
    product_text TEXT NOT NULL,
    embedding JSON NOT NULL,
    product_data JSON NOT NULL,
    model VARCHAR(191) NOT NULL,
    content_hash CHAR(64) NOT NULL,
    indexed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_semantic_embedding_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE,
    INDEX idx_semantic_embedding_hash (content_hash),
    INDEX idx_semantic_embedding_indexed (indexed_at)
) ENGINE=InnoDB;
