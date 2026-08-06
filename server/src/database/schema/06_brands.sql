CREATE TABLE brands (

    brand_id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    slug VARCHAR(150) NOT NULL,

    logo VARCHAR(500),

    status ENUM(
        'ACTIVE',
        'INACTIVE'
    ) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_brands_name
        UNIQUE (name),

    CONSTRAINT uq_brands_slug
        UNIQUE (slug)

);

CREATE INDEX idx_brands_status
ON brands(status);

CREATE INDEX idx_brands_slug
ON brands(slug);