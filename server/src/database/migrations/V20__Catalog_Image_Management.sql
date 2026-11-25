-- Add Cloudinary identity for category images and stable image ordering for products.
-- Existing product image rows keep their current order through image_id as a tie-breaker.

ALTER TABLE categories
    ADD COLUMN image_public_id VARCHAR(255) NULL AFTER image_url;

ALTER TABLE product_images
    ADD COLUMN display_order INT NOT NULL DEFAULT 0 AFTER is_primary,
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

CREATE INDEX idx_product_images_order
    ON product_images(product_id, display_order, image_id);

-- Rollback is intentionally omitted: image metadata is retained on existing rows.
