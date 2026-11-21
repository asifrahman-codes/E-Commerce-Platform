# Product Q&A and Support Tickets

## Database setup

Apply migrations after the existing loyalty and flash-sale migrations:

1. `server/src/database/migrations/V12__Product_Questions_Answers.sql`
2. `server/src/database/migrations/V13__Support_Tickets.sql`

The corresponding schema files are sourced by `server/src/database/schema/run_schema.sql`.

## Product questions and answers

- Customers submit authenticated questions for active products. Identical normalized questions by the same customer/product are rejected by a unique hash, and submissions are limited to five per customer per rolling 24-hour window.
- Questions with email addresses or phone numbers are rejected before storage. Public responses contain no customer ID, name, email, or other account data.
- Questions are private until an admin approves them. Admin answers are separately moderated and are only returned publicly after both the question and its answer are approved.
- A customer can mark an approved answer useful once. The vote table's `(answer_id, user_id)` primary key prevents duplicate counts.
- Admin tools are available at `/admin/product-questions`; public Q&A is embedded on product detail pages.

## Support tickets

- Authenticated customers can create tickets in the supported categories, choose a non-urgent priority, view their own ticket history, and exchange private messages with support.
- Admins can search and filter tickets by status, category, priority, subject, ticket number, customer name, or email. They can update status/priority, assign a ticket to themselves, and respond.
- Customer ticket queries include the authenticated user ID in the SQL predicate. Admin endpoints require the existing admin role middleware. No public ticket endpoints are registered.
- Messages are paginated newest-first in storage and returned chronologically to the UI; the conversation page can load older messages.
- A customer reply reopens a resolved ticket. Closed tickets cannot receive further replies.
- New tickets, replies, status updates, and approved Q&A answers create deduplicated in-app notifications. Notification delivery runs after the primary database transaction; failures are logged and do not roll back tickets or moderation changes.

Customer pages:

- `/support` — create a private support ticket
- `/support/tickets` — ticket history and search
- `/support/tickets/:ticketId` — private conversation

Admin pages:

- `/admin/support` — searchable ticket dashboard
- `/admin/support/:ticketId` — private conversation and ticket controls

