CREATE TABLE wishlist_items (

    wishlist_item_id INT AUTO_INCREMENT PRIMARY KEY,

    wishlist_id INT NOT NULL,

    product_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wishlist_items_wishlist
        FOREIGN KEY (wishlist_id)
        REFERENCES wishlists(wishlist_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_wishlist_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_wishlist_product
        UNIQUE (wishlist_id, product_id)

);

CREATE INDEX idx_wishlist_items_wishlist
ON wishlist_items(wishlist_id);

CREATE INDEX idx_wishlist_items_product
ON wishlist_items(product_id);