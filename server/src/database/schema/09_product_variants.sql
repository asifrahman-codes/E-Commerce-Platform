CREATE TABLE product_variants (

    variant_id INT AUTO_INCREMENT PRIMARY KEY,

    product_id INT NOT NULL,

    sku VARCHAR(100) NOT NULL,

    size VARCHAR(50),

    color VARCHAR(50),

    price_adjustment DECIMAL(10,2) DEFAULT 0.00,

    stock INT NOT NULL DEFAULT 0,

    status ENUM(
        'ACTIVE',
        'INACTIVE'
    ) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_variants_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_product_variants_sku
        UNIQUE (sku)

);

CREATE INDEX idx_product_variants_product
ON product_variants(product_id);

CREATE INDEX idx_product_variants_stock
ON product_variants(stock);

CREATE INDEX idx_product_variants_status
ON product_variants(status);