# Remaining issues

- Real Stripe/payment-provider credentials and external webhook delivery remain environment-dependent.
- The Excel export is Excel-compatible SpreadsheetML/`.xls`, not an OOXML `.xlsx` binary package.
- Back-in-stock rows are implemented, but an operational worker must process every restock event and send SMTP notifications.
- Bundle prices and referral reward completion require final product/order integration business rules for the specific merchant.
- Newsletter sends are subscription-management features; bulk email campaign delivery needs an external provider and templates.
- AI responses require valid provider credentials and can fail closed when unavailable.
- Docker and CI workflow files need environment-specific secrets and hosted database configuration before being considered deployed.
- Run a real MySQL migration, complete build/test suite, security review, and accessibility audit before declaring production readiness.
