# Customer notifications

The authenticated customer API is mounted at `/notifications`. It provides a
paginated list, unread count, read-one/read-all actions, and owner-scoped
deletion. Notification records use the unique `event_key` for deduplication.

Apply `server/src/database/migrations/V9__Customer_Notifications.sql` to
existing databases. Fresh installs using
`server/src/database/schema/run_schema.sql` create both the notifications
table and the retryable outbox.

Order cancellation, order confirmation and processing, payment status,
shipment dispatch, in-transit updates, delivery, and refunds generate in-app
notifications. These calls run after the business transaction commits and
fail independently of the completed order or shipment update.

## Optional email channel

Email is disabled by default. An SMTP adapter is available behind the email
provider interface; setting provider configuration alone is not proof of
delivery. To opt in, set `NOTIFICATION_EMAIL_ENABLED=true`,
`NOTIFICATION_EMAIL_PROVIDER=smtp`, `NOTIFICATION_EMAIL_FROM`, and valid
`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASSWORD`
values (`SMTP_PASS` is also accepted).
Verify delivery with a real test message before treating email as active.
Additional providers can implement `send(message)` and be registered through
the email service without changing notification business logic.

## Browser push

Browser push is not active. The repository has no push subscription storage,
service worker push handler, or VAPID configuration. Enabling it would require
those pieces, explicit browser permission, HTTPS in production, and verified
delivery through a configured push service.
