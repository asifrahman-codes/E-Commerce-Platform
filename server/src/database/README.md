# ShopSphere Database

## Comprehensive demo data

Run from the repository:

```powershell
cd server
npm run seed:demo
npm run seed:demo
npm run verify:demo
npm run reset:demo
```

Demo credentials:
- Admin: `demo.admin@shopsphere.example` / `DemoAdmin!2026`
- Customer: `demo.customer01@example.com` / `DemoCustomer!2026`

The seed is idempotent and inspects the live schema before inserting. It never runs stale schema dumps or reset scripts. The reset removes only records marked with `DEMO` or `demo-` identifiers.