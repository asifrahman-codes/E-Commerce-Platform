# Product recommendations

ShopSphere recommendations are explainable SQL rules over the existing
products, variants, orders, and order items. They do not use machine learning.
No recommendation or purchase-profile data is stored separately.

## Endpoints

- `GET /recommendations` returns `popular`, `best_selling`, and
  `new_arrivals` for guests and signed-in customers.
- `GET /recommendations/personalized` requires authentication. The customer ID
  is taken from the verified access token; a `user_id` query parameter is
  ignored. Only product results are returned, never order or purchase records.
- `GET /recommendations/products/:productId` returns same-category products,
  same-brand products, and frequently bought together products.
- `GET /recommendations/recently-viewed?ids=12,34` refreshes product data for
  IDs read from the browser's recently viewed list.

List endpoints accept an optional `limit` from 1 to 12 (default 8). Recently
viewed IDs are unique, positive product IDs, with a maximum of 8.

## Ranking rules

- **Popular:** products in delivered orders ranked by the number of distinct
  delivered orders containing each product.
- **Best-selling:** products in delivered orders ranked by summed item
  quantities.
- **New arrivals:** newest `created_at` first.
- **Related:** other currently available products with the same category.
- **Similar brand:** other currently available products with the same brand.
- **Frequently bought together:** products co-occurring in delivered orders,
  ranked by the number of such orders and then co-purchased quantity.
- **Personalized:** sums delivered item quantities by the customer's purchased
  categories and brands; candidates matching both contribute both weights.
  Products already present in that customer's delivered orders are excluded.
  The frontend falls back to popular products when there is no purchase
  history or no matching candidates.
- **Recently viewed:** product IDs are kept in browser storage; current product
  and stock information is reloaded from MySQL before display.

Product recommendations exclude inactive products and require at least one
active variant with positive stock. Prices use the base price plus the
variant's stored price adjustment. Query limits are bounded, and user-specific
queries are always scoped by the authenticated user. No cache is used because
inventory and order-derived rankings can change.

Focused tests are in `server/src/tests/recommendation.*.test.js`.
