CREATE TABLE carts (

    cart_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_carts_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_carts_user
        UNIQUE (user_id)

);

CREATE INDEX idx_carts_user
ON carts(user_id);