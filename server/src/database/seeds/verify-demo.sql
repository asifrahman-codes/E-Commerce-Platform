-- Run with: mysql -h <host> -P <port> -u <user> -p ecommerce_db < verify-demo.sql

USE ecommerce_db;

SELECT 'demo_users' AS metric, COUNT(*) AS total
FROM users
WHERE email = 'demo.admin@shopsphere.example'
   OR email LIKE 'demo.customer%@example.com';

SELECT 'categories' AS metric, COUNT(*) AS total FROM categories WHERE slug LIKE 'demo-%';
SELECT 'brands' AS metric, COUNT(*) AS total FROM brands WHERE slug LIKE 'demo-%';
SELECT 'products' AS metric, COUNT(*) AS total FROM products WHERE slug LIKE 'demo-product-%';
SELECT 'variants' AS metric, COUNT(*) AS total FROM product_variants WHERE sku LIKE 'DEMO-SKU-%';
SELECT 'images' AS metric, COUNT(*) AS total
FROM product_images
WHERE public_id LIKE 'external:unsplash:%'
   OR public_id LIKE 'demo-unsplash-product-%';
SELECT 'addresses' AS metric, COUNT(*) AS total FROM addresses WHERE street LIKE '[DEMO]%';
SELECT 'wishlists' AS metric, COUNT(*) AS total
FROM wishlists w
JOIN users u ON u.user_id = w.user_id
WHERE u.email LIKE 'demo.customer%@example.com';
SELECT 'coupons' AS metric, COUNT(*) AS total FROM coupons WHERE code LIKE 'DEMO%SAVE';
SELECT 'orders' AS metric, COUNT(*) AS total FROM orders WHERE order_number LIKE 'DEMO-%';
SELECT 'order_items' AS metric, COUNT(*) AS total
FROM order_items oi
JOIN orders o ON o.order_id = oi.order_id
WHERE o.order_number LIKE 'DEMO-%';
SELECT 'reviews' AS metric, COUNT(*) AS total FROM reviews WHERE title LIKE '[DEMO]%';
SELECT 'questions' AS metric, COUNT(*) AS total FROM product_questions WHERE question_text LIKE '[DEMO]%';
SELECT 'answers' AS metric, COUNT(*) AS total FROM product_answers WHERE answer_text LIKE '[DEMO]%';
SELECT 'notifications' AS metric, COUNT(*) AS total FROM notifications WHERE event_key LIKE 'demo.%';

-- Referenced catalog rows
SELECT COUNT(*) AS orphan_products
FROM products p
LEFT JOIN categories c ON c.category_id = p.category_id
LEFT JOIN brands b ON b.brand_id = p.brand_id
WHERE p.slug LIKE 'demo-product-%'
  AND (c.category_id IS NULL OR b.brand_id IS NULL);

-- Demo image validity
SELECT COUNT(*) AS invalid_demo_images
FROM product_images
WHERE (public_id LIKE 'external:unsplash:%' OR public_id LIKE 'demo-unsplash-product-%')
  AND (image_url IS NULL OR image_url NOT LIKE 'https://%');

SELECT COUNT(*) AS demo_products_with_leading_demo_name
FROM products
WHERE slug LIKE 'demo-product-%'
  AND name LIKE '[Demo]%';

-- Review uniqueness and validity
SELECT COUNT(*) AS duplicate_demo_reviews
FROM (
  SELECT product_id, user_id
  FROM reviews
  WHERE title LIKE '[DEMO]%'
  GROUP BY product_id, user_id
  HAVING COUNT(*) > 1
) duplicated;

SELECT COUNT(*) AS invalid_demo_review_ratings
FROM reviews
WHERE title LIKE '[DEMO]%'
  AND rating NOT BETWEEN 1 AND 5;

-- Order arithmetic and item validity
SELECT COUNT(*) AS invalid_demo_order_totals
FROM orders
WHERE order_number LIKE 'DEMO-%'
  AND ABS(total - (subtotal - discount + shipping + tax)) > 0.01;

SELECT COUNT(*) AS orphan_demo_order_items
FROM order_items oi
LEFT JOIN orders o ON o.order_id = oi.order_id
LEFT JOIN product_variants pv ON pv.variant_id = oi.variant_id
WHERE o.order_number LIKE 'DEMO-%'
  AND (o.order_id IS NULL OR pv.variant_id IS NULL);

-- Negative stock
SELECT COUNT(*) AS negative_demo_stock
FROM product_variants
WHERE sku LIKE 'DEMO-SKU-%'
  AND stock < 0;

SELECT COUNT(*) AS demo_products_with_fewer_than_three_questions
FROM products p
WHERE p.slug LIKE 'demo-product-%'
  AND (
    SELECT COUNT(*)
    FROM product_questions q
    WHERE q.product_id=p.product_id
      AND q.question_text LIKE '[DEMO]%'
  ) < 3;

SELECT COUNT(*) AS demo_questions_without_answers
FROM product_questions q
LEFT JOIN product_answers a ON a.question_id=q.question_id
WHERE q.question_text LIKE '[DEMO]%'
  AND a.answer_id IS NULL;

SELECT COUNT(*) AS orphan_demo_questions
FROM product_questions q
LEFT JOIN products p ON p.product_id=q.product_id
LEFT JOIN users u ON u.user_id=q.user_id
WHERE q.question_text LIKE '[DEMO]%'
  AND (p.product_id IS NULL OR u.user_id IS NULL);

SELECT COUNT(*) AS demo_shipments
FROM shipments s
JOIN orders o ON o.order_id=s.order_id
WHERE o.order_number LIKE 'DEMO-%';

SELECT COUNT(*) AS demo_tracking_events
FROM shipment_tracking_events te
JOIN shipments s ON s.shipment_id=te.shipment_id
JOIN orders o ON o.order_id=s.order_id
WHERE o.order_number LIKE 'DEMO-%';

SELECT COUNT(*) AS demo_support_tickets
FROM support_tickets
WHERE subject LIKE '[DEMO]%';
