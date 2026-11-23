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

## Commerce, marketing, and platform APIs

All endpoints use the configured API prefix (default `/api/v1`). Admin endpoints require an `Authorization: Bearer <access-token>` with the `ADMIN` role.

- `GET /platform/bundles` - active, scheduled database-backed product bundles.
- `POST /platform/bundles` - create a bundle (admin).
- `POST /platform/back-in-stock` - subscribe an email to a product or variant restock notification.
- `POST /platform/newsletter/subscribe` - subscribe a validated email address.
- `POST /platform/newsletter/unsubscribe` - unsubscribe an email address.
- `POST /platform/wishlist/share` - create a share link from the authenticated customer's current wishlist.
- `GET /platform/wishlist/shared/:token` - retrieve a non-expired shared wishlist.
- `POST /platform/referrals/code` - create an authenticated customer's referral code.
- `POST /platform/referrals/apply` - apply a referral code to the authenticated customer.
- `GET|POST /platform/campaigns` - list or create promotional campaigns (admin).
- `GET /platform/admin/store-settings` - list store settings (admin).
- `GET /platform/admin/store-settings/:key` - retrieve one setting (admin).
- `PUT /platform/admin/store-settings` - update allowed settings (admin).
- `GET /platform/admin/audit-logs?limit=100` - retrieve audit records (admin).
- `GET /platform/admin/customer-segments` - real customer counts grouped as VIP, active, prospect, and at-risk from orders and account data (admin).
- `GET /platform/admin/inventory-forecast?days=30` - calculate stock estimates from recorded sales and inventory transactions (admin).
- `GET /platform/admin/reports/sales.csv` - sales data CSV export (admin).
- `GET /platform/admin/reports/sales.xls` - Excel-compatible SpreadsheetML sales export (admin).

The AI assistant endpoint remains backend-only for credentials:

- `POST /ai/assistant` - send a shopping message. No API key or provider secret is exposed to the browser.