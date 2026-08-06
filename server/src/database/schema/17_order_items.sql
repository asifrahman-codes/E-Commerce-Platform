CREATE TABLE order_items (

    order_item_id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    variant_id INT NOT NULL,

    product_name VARCHAR(255) NOT NULL,

    sku VARCHAR(100) NOT NULL,

    unit_price DECIMAL(10,2) NOT NULL,

    quantity INT NOT NULL,

    total_price DECIMAL(10,2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_variant
        FOREIGN KEY (variant_id)
        REFERENCES product_variants(variant_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_order_item_quantity
        CHECK (quantity > 0)

);

CREATE INDEX idx_order_items_order
ON order_items(order_id);

CREATE INDEX idx_order_items_variant
ON order_items(variant_id);