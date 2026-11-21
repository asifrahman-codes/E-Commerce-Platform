## Product discovery

`GET /products/search` returns active products with pagination metadata.

Supported query parameters:

- `q`: up to 100 characters; searches product name, description, brand, and variant SKU.
- `category_id`, `brand_id`: positive integer filters.
- `min_price`, `max_price`: non-negative variant-aware price bounds.
- `in_stock`: `true` or `false`; availability is based on active variants.
- `sort`: `newest`, `oldest`, `name_asc`, `name_desc`, `price_asc`, `price_desc`, `rating_asc`, `rating_desc`, `popularity`, or `best_selling`.
- `page`: positive page number; `limit`: 1–50 (default 12).

The response contains `filters`, `products`, and a `pagination` object with
`page`, `limit`, `total_items`, `total_pages`, `has_next_page`, and
`has_previous_page`. Apply migration `V8__Product_Discovery_Indexes.sql` to
existing MySQL databases before enabling full-text catalog search.

## Product comparison

`GET /products/compare?ids=12,34` returns current public data for one to four
active products. IDs must be positive, unique integers; missing or inactive
products return `404`. The response includes category, brand, primary image,
description, variant-aware price range, active variant stock, and the actual
size, color, and SKU values present in the catalog.

Comparison selections are stored in the browser (`localStorage`) for both
guest and signed-in customers. The server stores no comparison records.

## Product recommendations

See [RECOMMENDATIONS.md](./RECOMMENDATIONS.md) for recommendation endpoints,
authentication requirements, and SQL ranking rules. Recommendations are
rule-based and calculated from current catalog data and delivered orders;
they are not machine-learning predictions.