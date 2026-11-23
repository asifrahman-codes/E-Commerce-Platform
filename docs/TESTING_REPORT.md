# Testing report

## Automated coverage

The server has Vitest unit/integration coverage for authentication, roles, transactions, checkout, loyalty, flash sales, pricing, recommendations, product discovery/comparison, product Q&A, support tickets, notifications, webhooks, and the newly added platform validation.

Run:

```sh
cd server
npm test
```

Build:

```sh
cd client
npm run build
```

## Required workflow verification

Before release, execute the following against a disposable database:

1. Customer register -> login -> browse/search -> add to wishlist -> cart -> mock checkout -> payment -> order -> tracking -> review.
2. Admin login -> dashboard -> products -> inventory -> orders -> payments -> shipments -> customers -> reports.
3. Create a coupon and verify server-calculated eligibility and usage limits.
4. Create a flash sale and confirm scheduled effective pricing.
5. Create a bundle and verify only active items are exposed.
6. Subscribe to newsletter and back-in-stock records.
7. Create and open a wishlist share link.
8. Apply a referral code and verify no duplicate referred-user use.
9. Export CSV and Excel-compatible reports and open the files.
10. Update store settings and verify audit log entries.
