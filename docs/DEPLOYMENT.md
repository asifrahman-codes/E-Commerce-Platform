# Production deployment

This document describes a deployment checklist for a real environment. It does not assert that a specific deployment is already production-ready.

## Environment

- Use a separate production MySQL database and backup account.
- Set `NODE_ENV=production`.
- Set strong unique `JWT_SECRET` and refresh-token secrets.
- Restrict `CORS_ORIGINS` to the deployed storefront origins.
- Set `TRUST_PROXY` only when deployed behind a known reverse proxy.
- Keep Gemini/OpenRouter/Stripe/SMTP secrets only in server environment variables.
- Set the Cloudinary credentials if image uploads are enabled.
- Configure HTTPS and secure cookie settings at the reverse proxy/application boundary.

## Database

1. Create the database and run `server/src/database/schema/run_schema.sql`.
2. Apply migrations in ascending V-number order.
   For catalog image management, apply `server/src/database/migrations/V20__Catalog_Image_Management.sql` after V19 and before deploying the updated API.
3. Run seed scripts only for intentional initial data.
4. Test migrations against a restored copy of production before release.
5. Schedule encrypted backups and periodic restore drills using the scripts under `server/src/database/backups`.

## Services

- Run Express with a process manager or container orchestration.
- Run the notification worker separately when SMTP notifications are enabled.
- Use `/health/live` for process liveness and `/health/ready` for database readiness.
- Terminate TLS at the reverse proxy/load balancer and forward only trusted proxy headers.
- Put uploads and static assets behind CDN/object storage when scale requires it.

## Release

1. Install dependencies.
2. Run migrations.
3. Run server tests and client build.
4. Deploy the API and notification worker.
5. Deploy the client with a production `VITE_API_BASE_URL`.
6. Verify health, login, search, cart, checkout, and admin report endpoints.

## Rollback

Restore the previous application artifact and, only if the database migration is incompatible, restore the database backup. Database rollbacks must be tested and documented per release.
