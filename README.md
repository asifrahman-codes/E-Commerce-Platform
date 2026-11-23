# ShopSphere

ShopSphere is a full-stack e-commerce platform with a React/Vite storefront and an Express/MySQL API.

## Stack

- React 19, React Router, Axios, Tailwind CSS/Vite
- Node.js, Express 5, MySQL 2
- JWT authentication, role authorization, rate limiting, Helmet, CORS
- Stripe/mock payment providers
- Vitest/Supertest server tests

## Core features

The platform includes registration/login, catalog browsing and autocomplete search, product variants and images, comparison, recently viewed products, recommendations, wishlist sharing, cart and checkout, mock/COD/online payment support, order tracking, reviews, product Q&A, support tickets, flash sales, loyalty points, product bundles, referrals, newsletter subscriptions, back-in-stock subscriptions, promotional campaigns, coupons, inventory management, shipment management, reports, customer segmentation, inventory forecasting, store settings, and audit logs.

Use the mock payment flow for local testing. It is not a claim of live payment processing.

## Local setup

1. Install dependencies:
   - `cd server && npm install`
   - `cd ../client && npm install`
2. Copy `.env.example` files and configure MySQL, JWT, CORS, and provider values.
3. Create/import the database using `server/src/database/schema/run_schema.sql`, seed data if needed, then apply migrations in version order.
4. Start MySQL and the API:
   - `cd server && npm run dev`
5. Start the storefront:
   - `cd client && npm run dev`

API documentation is in [docs/API.md](docs/API.md). Database backup scripts are under [server/src/database/backups](server/src/database/backups).

## Testing

Run the server suite:

```sh
cd server
npm test
```

Build the client:

```sh
cd client
npm run build
```

Test data must come from the configured MySQL database. AI responses and reporting data are not fabricated by the application.