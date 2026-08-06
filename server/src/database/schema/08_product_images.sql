CREATE TABLE product_images (

    image_id INT AUTO_INCREMENT PRIMARY KEY,

    product_id INT NOT NULL,

    image_url VARCHAR(500) NOT NULL,

    public_id VARCHAR(255) NOT NULL,

    is_primary BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE

);

CREATE INDEX idx_product_images_product
ON product_images(product_id);

CREATE INDEX idx_product_images_primary
ON product_images(is_primary);