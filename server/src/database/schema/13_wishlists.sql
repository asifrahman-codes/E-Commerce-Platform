CREATE TABLE wishlists (

    wishlist_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_wishlists_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_wishlist_user
        UNIQUE (user_id)

);

CREATE INDEX idx_wishlist_user
ON wishlists(user_id);