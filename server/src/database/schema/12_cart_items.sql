CREATE TABLE cart_items (

    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,

    cart_id INT NOT NULL,

    variant_id INT NOT NULL,

    quantity INT NOT NULL DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id)
        REFERENCES carts(cart_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cart_items_variant
        FOREIGN KEY (variant_id)
        REFERENCES product_variants(variant_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_cart_quantity
        CHECK (quantity > 0),

    CONSTRAINT uq_cart_variant
        UNIQUE (cart_id, variant_id)

);

CREATE INDEX idx_cart_items_cart
ON cart_items(cart_id);

CREATE INDEX idx_cart_items_variant
ON cart_items(variant_id);