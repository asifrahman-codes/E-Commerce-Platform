# Loyalty Rewards and Flash Sales

## Database setup

Apply the migrations in order after the existing schema:

1. `server/src/database/migrations/V10__Loyalty_Rewards.sql`
2. `server/src/database/migrations/V11__Flash_Sales.sql`

They install `loyalty_settings`, the per-customer point ledger and point lots, plus campaign targets and redemption records. `server/src/database/schema/run_schema.sql` also sources the new schema files for fresh schema setup.

Campaign schedules are stored as UTC `DATETIME` values. The admin page converts local date/time inputs to ISO UTC before saving. Keep the application database connection using UTC timestamps; the backend uses `UTC_TIMESTAMP()` for activation and point-expiry decisions.

## Loyalty rules

- Defaults are 1 point per PKR 100 of merchandise paid after discounts; shipping and tax do not earn points.
- 100 points redeem for PKR 1. The admin can change earning and redemption rates, minimum redemption, and optionally configure an expiry period.
- A point is earned only after the order is both `DELIVERED` and `PAID`. Delivery and payment completion hooks are idempotent on `order:<id>:loyalty-earn`.
- Earnings are floored to whole points. Redemption consumes the soonest-expiring point lots first and is locked with the account row in the checkout transaction.
- Cancellation and full refund restore points redeemed on that order. A full refund also reverses points earned from that order. If already-spent points must be reversed, the balance can go negative and future earning offsets it. Points already removed by expiry are not expired a second time.
- Partial refunds are not represented by the existing order workflow and therefore do not have proportional point adjustment.
- `loyalty_transactions` records point and currency amounts; redemptions, restores, reversals, expiry, point-lot allocations, and balances are updated transactionally.

Customer endpoints (authenticated):

- `GET /api/v1/loyalty/me`
- `GET /api/v1/loyalty/transactions?page=1&limit=20`
- `POST /api/v1/orders/preview` accepts optional `loyalty_points`.
- `POST /api/v1/orders` accepts optional `loyalty_points`; the server revalidates the balance and discount in the order transaction.

Admin settings:

- `GET /api/v1/loyalty/admin/settings`
- `PATCH /api/v1/loyalty/admin/settings`

## Flash sale rules

- Admin campaigns can target existing products (all active variants) or specific active variants. A target can have an optional per-customer quantity limit; the locked variant stock remains the global purchase cap.
- Start/end comparisons use UTC database time. The campaign is scheduled before its start, active only within its time window, and expired after its end. No scheduler is required for pricing correctness: the checkout query enforces the window, while the admin API reports effective status.
- Campaign creation rejects overlapping active campaign targets over intersecting time windows. Campaign target edits are blocked after a target has been purchased so the audit trail remains intact.
- Sale price is computed from the current product base price plus the selected variant adjustment. Percentage discounts are capped at 100%; fixed discounts cannot create a negative price.
- Inventory is still checked and reduced under the existing variant row lock. Per-customer usage is checked under campaign target locks and written to `flash_sale_redemptions`; cancellation and refund release that usage.
- Flash-sale prices, coupons, and reward-point redemptions are mutually exclusive. All totals and discounts are recalculated by the backend during preview and order placement.
- `flash_sale_redemptions` stores the applied discount amount and the campaign's discount type/value snapshot alongside quantity and order reference.

Customer endpoint:

- `GET /api/v1/flash-sales` returns active and upcoming campaigns using real, active, in-stock product variants and current prices.

Admin endpoints:

- `GET /api/v1/admin/flash-sales`
- `POST /api/v1/admin/flash-sales`
- `PATCH /api/v1/admin/flash-sales/:saleId`

The admin page is `/admin/rewards-sales`, the customer rewards page is `/account/loyalty`, and the public campaign landing page is `/flash-sales`.

## Recommendation calculation

Rewards are deterministic ledger entries, not estimated by the browser. The checkout UI only submits a desired point count; the backend checks account balance, minimum redemption, merchandise total, and stacking rules. Flash-sale card and admin preview prices are calculated from product and variant rows; no sample product data is used.
