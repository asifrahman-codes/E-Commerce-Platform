CREATE TABLE addresses (

    address_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    country VARCHAR(100) NOT NULL,

    city VARCHAR(100) NOT NULL,

    postal_code VARCHAR(20),

    street VARCHAR(255) NOT NULL,

    is_default BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_addresses_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE

);

CREATE INDEX idx_addresses_user
ON addresses(user_id);