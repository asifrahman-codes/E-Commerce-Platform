DROP TABLE IF EXISTS wishlists;

CREATE TABLE wishlists (
    wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wishlists_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_wishlists_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_wishlist_user_product
        UNIQUE (user_id, product_id)
);

CREATE INDEX idx_wishlists_user
ON wishlists(user_id);

CREATE INDEX idx_wishlists_product
ON wishlists(product_id);