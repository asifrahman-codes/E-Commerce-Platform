CREATE TABLE categories (

    category_id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    slug VARCHAR(150) NOT NULL,

    description TEXT,

    image_url VARCHAR(500),

    status ENUM(
        'ACTIVE',
        'INACTIVE'
    ) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_categories_name
        UNIQUE (name),

    CONSTRAINT uq_categories_slug
        UNIQUE (slug)

);

CREATE INDEX idx_categories_status
ON categories(status);

CREATE INDEX idx_categories_slug
ON categories(slug);