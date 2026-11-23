/**
 * Precise reset for records created by demo-seed.js.
 * No broad reset/truncate. Marker and DEMO identifiers are the only deletion keys.
 */
import "../../config/env.js";
import { pool } from "../index.js";

async function hasTable(connection, table) {
  const [[row]] = await connection.execute(
    "SELECT COUNT(*) AS c FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?", [table]
  );
  return Number(row.c) > 0;
}

async function run(connection, sql, params = []) {
  const [result] = await connection.execute(sql, params);
  return result.affectedRows;
}

async function main() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const deleted = {};

    if (await hasTable(connection, "notifications")) deleted.notifications = await run(connection,
      "DELETE FROM notifications WHERE event_key LIKE 'demo.%' OR title LIKE '[DEMO]%'");
    if (await hasTable(connection, "shipment_tracking_events")) deleted.trackingEvents = await run(connection,
      "DELETE te FROM shipment_tracking_events te JOIN shipments s ON s.shipment_id=te.shipment_id JOIN orders o ON o.order_id=s.order_id WHERE o.order_number LIKE 'DEMO-%'");
    if (await hasTable(connection, "shipments")) deleted.shipments = await run(connection,
      "DELETE s FROM shipments s JOIN orders o ON o.order_id=s.order_id WHERE o.order_number LIKE 'DEMO-%'");
    if (await hasTable(connection, "payment_webhook_events")) deleted.paymentWebhooks = await run(connection,
      "DELETE w FROM payment_webhook_events w JOIN online_payment_attempts a ON a.attempt_id=w.attempt_id JOIN orders o ON o.order_id=a.order_id WHERE o.order_number LIKE 'DEMO-%'");
    if (await hasTable(connection, "online_payment_attempts")) deleted.onlinePaymentAttempts = await run(connection,
      "DELETE a FROM online_payment_attempts a JOIN orders o ON o.order_id=a.order_id WHERE o.order_number LIKE 'DEMO-%'");
    if (await hasTable(connection, "loyalty_point_lots")) deleted.loyaltyLots = await run(connection,
      "DELETE l FROM loyalty_point_lots l JOIN users u ON u.user_id=l.user_id WHERE u.email LIKE 'demo.customer%@example.com'");
    if (await hasTable(connection, "loyalty_redemption_allocations")) deleted.loyaltyAllocations = await run(connection,
      "DELETE ra FROM loyalty_redemption_allocations ra JOIN loyalty_transactions lt ON lt.transaction_id=ra.redemption_transaction_id JOIN users u ON u.user_id=lt.user_id WHERE u.email LIKE 'demo.customer%@example.com'");
    if (await hasTable(connection, "loyalty_transactions")) deleted.loyaltyTransactions = await run(connection,
      "DELETE lt FROM loyalty_transactions lt JOIN users u ON u.user_id=lt.user_id WHERE lt.event_key LIKE 'demo.%' AND u.email LIKE 'demo.customer%@example.com'");
    if (await hasTable(connection, "support_ticket_messages")) deleted.supportMessages = await run(connection,
      "DELETE m FROM support_ticket_messages m JOIN support_tickets t ON t.ticket_id=m.ticket_id WHERE t.subject LIKE '[DEMO]%'");
    if (await hasTable(connection, "support_tickets")) deleted.supportTickets = await run(connection,
      "DELETE FROM support_tickets WHERE subject LIKE '[DEMO]%'");
    if (await hasTable(connection, "product_answer_votes")) deleted.answerVotes = await run(connection,
      "DELETE v FROM product_answer_votes v JOIN product_answers a ON a.answer_id=v.answer_id JOIN product_questions q ON q.question_id=a.question_id WHERE q.question_text LIKE '[DEMO]%'");
    if (await hasTable(connection, "product_answers")) deleted.answers = await run(connection,
      "DELETE FROM product_answers WHERE answer_text LIKE '[DEMO]%'");
    if (await hasTable(connection, "product_questions")) deleted.questions = await run(connection,
      "DELETE FROM product_questions WHERE question_text LIKE '[DEMO]%'");
    if (await hasTable(connection, "reviews")) deleted.reviews = await run(connection,
      "DELETE FROM reviews WHERE title LIKE '[DEMO]%'");
    if (await hasTable(connection, "payments")) deleted.payments = await run(connection,
      "DELETE FROM payments WHERE transaction_id LIKE 'DEMO-COD-DEMO-%'");
    if (await hasTable(connection, "order_status_history")) deleted.statusHistory = await run(connection,
      "DELETE FROM order_status_history WHERE notes LIKE '[DEMO]%'");
    if (await hasTable(connection, "order_items")) deleted.orderItems = await run(connection,
      "DELETE oi FROM order_items oi JOIN orders o ON o.order_id=oi.order_id WHERE o.order_number LIKE 'DEMO-%'");
    if (await hasTable(connection, "coupon_usages")) deleted.couponUsage = await run(connection,
      "DELETE FROM coupon_usages WHERE coupon_id IN (SELECT coupon_id FROM coupons WHERE code LIKE 'DEMO%SAVE')");
    if (await hasTable(connection, "orders")) deleted.orders = await run(connection,
      "DELETE FROM orders WHERE order_number LIKE 'DEMO-%'");
    if (await hasTable(connection, "cart_items")) deleted.cartItems = await run(connection,
      "DELETE ci FROM cart_items ci JOIN carts c ON c.cart_id=ci.cart_id JOIN users u ON u.user_id=c.user_id WHERE u.email LIKE 'demo.customer%@example.com' OR u.email='demo.admin@shopsphere.example'");
    if (await hasTable(connection, "wishlist_items")) deleted.wishlistItems = await run(connection,
      "DELETE wi FROM wishlist_items wi JOIN wishlists w ON w.wishlist_id=wi.wishlist_id JOIN users u ON u.user_id=w.user_id WHERE u.email LIKE 'demo.customer%@example.com' OR u.email='demo.admin@shopsphere.example'");
    if (await hasTable(connection, "carts")) deleted.carts = await run(connection,
      "DELETE c FROM carts c JOIN users u ON u.user_id=c.user_id WHERE u.email LIKE 'demo.customer%@example.com' OR u.email='demo.admin@shopsphere.example'");
    if (await hasTable(connection, "wishlists")) deleted.wishlists = await run(connection,
      "DELETE w FROM wishlists w JOIN users u ON u.user_id=w.user_id WHERE u.email LIKE 'demo.customer%@example.com' OR u.email='demo.admin@shopsphere.example'");
    if (await hasTable(connection, "addresses")) deleted.addresses = await run(connection,
      "DELETE a FROM addresses a JOIN users u ON u.user_id=a.user_id WHERE a.street LIKE '[DEMO]%'");
    if (await hasTable(connection, "coupons")) deleted.coupons = await run(connection,
      "DELETE FROM coupons WHERE code LIKE 'DEMO%SAVE'");
    if (await hasTable(connection, "inventory_transactions")) deleted.inventoryTransactions = await run(connection,
      "DELETE FROM inventory_transactions WHERE notes LIKE '[DEMO]%'");
    if (await hasTable(connection, "product_images")) deleted.productImages = await run(connection,
      "DELETE FROM product_images WHERE public_id LIKE 'external:unsplash:%' OR public_id LIKE 'demo-unsplash-product-%'");
    if (await hasTable(connection, "product_variants")) deleted.variants = await run(connection,
      "DELETE FROM product_variants WHERE sku LIKE 'DEMO-SKU-%'");
    if (await hasTable(connection, "products")) deleted.products = await run(connection,
      "DELETE FROM products WHERE slug LIKE 'demo-product-%'");
    if (await hasTable(connection, "categories")) deleted.categories = await run(connection,
      "DELETE FROM categories WHERE slug LIKE 'demo-%'");
    if (await hasTable(connection, "brands")) deleted.brands = await run(connection,
      "DELETE FROM brands WHERE slug LIKE 'demo-%'");
    if (await hasTable(connection, "loyalty_accounts")) deleted.loyaltyAccounts = await run(connection,
      "DELETE la FROM loyalty_accounts la JOIN users u ON u.user_id=la.user_id WHERE u.email LIKE 'demo.customer%@example.com'");

    // Optional feature records with exact demo names/event markers.
    if (await hasTable(connection, "wishlist_share_items")) deleted.wishlistShareItems = await run(connection,
      "DELETE wi FROM wishlist_share_items wi JOIN wishlist_shares ws ON ws.share_id=wi.share_id JOIN users u ON u.user_id=ws.user_id WHERE u.email LIKE 'demo.customer%@example.com'");
    if (await hasTable(connection, "wishlist_shares")) deleted.wishlistShares = await run(connection,
      "DELETE ws FROM wishlist_shares ws JOIN users u ON u.user_id=ws.user_id WHERE u.email LIKE 'demo.customer%@example.com'");
    if (await hasTable(connection, "back_in_stock_subscriptions")) deleted.backInStock = await run(connection,
      "DELETE s FROM back_in_stock_subscriptions s JOIN users u ON u.user_id=s.user_id WHERE u.email LIKE 'demo.customer%@example.com'");
    if (await hasTable(connection, "referral_uses")) deleted.referralUses = await run(connection,
      "DELETE ru FROM referral_uses ru JOIN referral_codes rc ON rc.referral_code_id=ru.referral_code_id JOIN users u ON u.user_id=rc.user_id WHERE u.email LIKE 'demo.customer%@example.com'");
    if (await hasTable(connection, "referral_codes")) deleted.referralCodes = await run(connection,
      "DELETE rc FROM referral_codes rc JOIN users u ON u.user_id=rc.user_id WHERE u.email LIKE 'demo.customer%@example.com'");
    if (await hasTable(connection, "flash_sales")) deleted.flashSales = await run(connection,
      "DELETE FROM flash_sales WHERE title LIKE '[DEMO]%'");
    if (await hasTable(connection, "product_bundles")) deleted.bundles = await run(connection,
      "DELETE FROM product_bundles WHERE name LIKE '[DEMO]%'");
    if (await hasTable(connection, "promotional_campaigns")) deleted.campaigns = await run(connection,
      "DELETE FROM promotional_campaigns WHERE name LIKE '[DEMO]%'");
    if (await hasTable(connection, "newsletter_subscribers")) deleted.newsletter = await run(connection,
      "DELETE FROM newsletter_subscribers WHERE email LIKE 'demo.customer%@example.com'");

    deleted.users = await run(connection,
      "DELETE FROM users WHERE email IN ('demo.admin@shopsphere.example') OR email LIKE 'demo.customer%@example.com'");

    await connection.commit();
    console.log(JSON.stringify(deleted, null, 2));
  } catch (error) {
    await connection.rollback();
    console.error(`reset-demo failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

main();
