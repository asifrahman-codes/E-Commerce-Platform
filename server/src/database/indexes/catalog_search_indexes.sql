CREATE FULLTEXT INDEX ft_products_name_description_slug
ON products(name, description, slug);

CREATE FULLTEXT INDEX ft_brands_name
ON brands(name);

CREATE FULLTEXT INDEX ft_product_variants_sku
ON product_variants(sku);

CREATE INDEX idx_products_status_category_created
ON products(status, category_id, created_at, product_id);

CREATE INDEX idx_products_status_created
ON products(status, created_at, product_id);

CREATE INDEX idx_products_status_brand_created
ON products(status, brand_id, created_at, product_id);

CREATE INDEX idx_product_variants_product_status_stock
ON product_variants(product_id, status, stock);

CREATE INDEX idx_product_images_product_primary
ON product_images(product_id, is_primary, image_id);

CREATE INDEX idx_product_variants_product_status_price
ON product_variants(product_id, status, price_adjustment);

CREATE INDEX idx_order_items_variant_order_quantity
ON order_items(variant_id, order_id, quantity);
