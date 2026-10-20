
import pool from "../database/index.js";
import { stripe } from "../config/payment.js";
import ApiError from "../utils/ApiError.js";

import {
  findPaymentByProviderSession,
  recordWebhookEvent,
  completeWebhookEvent,
  markPaymentSucceeded,
  markPaymentFailed,
} from "../repositories/payment.repository.js";

export async function stripeWebhookController(req, res, next) {
  let event;

  try {
    const signature = req.headers["stripe-signature"];

    if (!signature || !stripe) {
      throw new ApiError(400, "Missing Stripe signature or configuration");
    }

    // req.body must be the original raw Buffer, not parsed JSON.
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid webhook signature or payload",
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const registered = await recordWebhookEvent(
      "stripe",
      event.id,
      event.type,
      connection
    );

    if (!registered.inserted) {
      await connection.rollback();

      // The event was already recorded. A duplicate delivery is expected
      // behavior and should not cause another payment update.
      return res.status(200).json({
        received: true,
        duplicate: true,
      });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Some payment methods can complete the Checkout Session before
      // settlement. Require the gateway's paid state for this implementation.
      if (session.payment_status !== "paid") {
        await completeWebhookEvent(registered.id, connection);
        await connection.commit();
        return res.status(200).json({ received: true });
      }

      const payment = await findPaymentByProviderSession(
        "stripe",
        session.id,
        connection,
        true
      );

      if (!payment) {
        throw new Error("No matching payment record for Stripe session");
      }

      if (
        String(session.metadata?.payment_id) !== String(payment.payment_id) ||
        String(session.metadata?.order_id) !== String(payment.order_id)
      ) {
        throw new Error("Stripe session metadata does not match payment");
      }

      if (
        Number(session.amount_total) !== Math.round(Number(payment.amount) * 100) ||
        String(session.currency).toUpperCase() !== String(payment.currency).toUpperCase()
      ) {
        throw new Error("Gateway amount or currency does not match payment");
      }

      const [orders] = await connection.execute(
        `SELECT order_id, payment_status, status, total
         FROM orders
         WHERE order_id = ?
         FOR UPDATE`,
        [payment.order_id]
      );

      const order = orders[0];

      if (!order) {
        throw new Error("Payment references a missing order");
      }

      if (Number(order.total) !== Number(payment.amount)) {
        throw new Error("Saved order total differs from payment amount");
      }

      if (order.payment_status === "PAID") {
        // Already paid by a different successful attempt: do not charge it
        // again internally. Flag this event for reconciliation/refund review.
        throw new Error("Order already paid by another payment attempt");
      }

      if (["CANCELLED", "REFUNDED"].includes(order.status)) {
        // Never silently resurrect a cancelled order. Operations must
        // reconcile/refund this late payment.
        throw new Error("Payment succeeded for a cancelled/refunded order");
      }

      await markPaymentSucceeded(
        payment.payment_id,
        session.payment_intent ?? null,
        connection
      );

      await connection.execute(
        `UPDATE orders
         SET payment_status = 'PAID',
             status = CASE
               WHEN status = 'PENDING' THEN 'CONFIRMED'
               ELSE status
             END
         WHERE order_id = ?
           AND payment_status <> 'PAID'
           AND status NOT IN ('CANCELLED', 'REFUNDED')`,
        [payment.order_id]
      );
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object;

      const payment = await findPaymentByProviderSession(
        "stripe",
        session.id,
        connection,
        true
      );

      if (payment) {
        await markPaymentFailed(
          payment.payment_id,
          event.type,
          connection
        );

        // Do not set an order to FAILED if another attempt has already paid it.
        await connection.execute(
          `UPDATE orders
           SET payment_status = 'FAILED'
           WHERE order_id = ?
             AND payment_status = 'PENDING'
             AND status NOT IN ('CANCELLED', 'REFUNDED')`,
          [payment.order_id]
        );
      }
    }

    await completeWebhookEvent(registered.id, connection);
    await connection.commit();

    return res.status(200).json({ received: true });
  } catch (error) {
    await connection.rollback();

    // Return a failure so the gateway retries transient processing failures.
    // Alert on repeated failures; do not expose database details to the caller.
    console.error("Stripe webhook processing failed:", {
      eventId: event.id,
      eventType: event.type,
      message: error.message,
    });

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  } finally {
    connection.release();
  }
}
