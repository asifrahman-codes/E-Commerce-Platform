CREATE TABLE products (

    product_id INT AUTO_INCREMENT PRIMARY KEY,

    category_id INT NOT NULL,

    brand_id INT NOT NULL,

    name VARCHAR(255) NOT NULL,

    slug VARCHAR(255) NOT NULL,

    description TEXT,

    base_price DECIMAL(10,2) NOT NULL,

    status ENUM(
        'ACTIVE',
        'INACTIVE',
        'OUT_OF_STOCK'
    ) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_products_brand
        FOREIGN KEY (brand_id)
        REFERENCES brands(brand_id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_products_slug
        UNIQUE (slug)

);

CREATE INDEX idx_products_category
ON products(category_id);

CREATE INDEX idx_products_brand
ON products(brand_id);

CREATE INDEX idx_products_status
ON products(status);

CREATE INDEX idx_products_slug
ON products(slug);