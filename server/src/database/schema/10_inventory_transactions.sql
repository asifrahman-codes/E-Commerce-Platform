CREATE TABLE inventory_transactions (

    transaction_id INT AUTO_INCREMENT PRIMARY KEY,

    variant_id INT NOT NULL,

    quantity_change INT NOT NULL,

    transaction_type ENUM(
        'PURCHASE',
        'SALE',
        'RETURN',
        'ADJUSTMENT'
    ) NOT NULL,

    reference_id INT NULL,

    notes VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_transactions_variant
        FOREIGN KEY (variant_id)
        REFERENCES product_variants(variant_id)
        ON DELETE CASCADE

);

CREATE INDEX idx_inventory_variant
ON inventory_transactions(variant_id);

CREATE INDEX idx_inventory_type
ON inventory_transactions(transaction_type);

CREATE INDEX idx_inventory_created
ON inventory_transactions(created_at);