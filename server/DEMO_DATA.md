# ShopSphere demo data

## Install

Run from the `server` directory:

```powershell
npm run seed:demo
```

The seed is transactional and idempotent. It uses `[DEMO]` text, `DEMO-*` identifiers,
`demo-*` slugs, and `demo.*` notification event keys so later runs and reset operations
can distinguish generated records from existing project data.

The seed requires the normal server `.env` database settings. It does not use production
credentials or store plaintext passwords.

## Verify

```powershell
npm run verify:demo
```

## Repeat safely

```powershell
npm run seed:demo
npm run verify:demo
```

A second run should add no duplicate demo records. It may repair missing demo records,
but existing rows are reused.

## Demo login

- Admin: `demo.admin@shopsphere.example`
- Admin password: `DemoAdmin!2026`
- Customer: `demo.customer01@example.com`
- Customer password: `DemoCustomer!2026`

Additional demo customers use `demo.customer02@example.com` through
`demo.customer20@example.com` and the same customer password.

## Reset only demo records

```powershell
cd server
npm run reset:demo
```

The reset only deletes records matched by DEMO markers, demo slugs/SKUs/order numbers,
demo emails, demo notification event keys, or demo public image IDs. It does not truncate
tables or delete existing users, products, orders, coupons, or catalog records that predate
the seed.
