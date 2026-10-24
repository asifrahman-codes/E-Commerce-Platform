
import crypto from "node:crypto";
import { pool } from "../database/index.js";
import paymentConfig from "../config/payment.config.js";
import { getPaymentGateway } from "../utils/gateways/payment-gateway.factory.js";

import {
  findOrderForUpdate,
  findAttemptForUpdate,
  findActiveAttemptForOrder,
  createAttempt,
  updateAttemptCheckout,
  markAttemptInitiationFailed,
  findAttemptByIdForUser,
  findAttemptsByUser,
  findOrderAttempts,
} from "../repositories/online-payment.repository.js";

import {
  notifyOrderConfirmed,
} from "./notification.service.js";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeAmount(value) {
  return Number(Number(value).toFixed(2));
}

function isFinalStatus(status) {
  return ["SUCCEEDED", "FAILED", "CANCELLED", "REFUNDED"].includes(
    status
  );
}

// --------------------------------------------------
// Initiate Online Payment
// --------------------------------------------------

export async function initiateOnlinePaymentService({
  userId,
  orderId,
}) {
  const connection = await pool.getConnection();

  let attempt;
  let createdNewAttempt = false;

  try {
    await connection.beginTransaction();

    const order = await findOrderForUpdate(
      connection,
      orderId,
      userId
    );

    if (!order) {
      throw httpError(404, "Order not found");
    }

    if (["CANCELLED", "REFUNDED"].includes(order.status)) {
      throw httpError(
        400,
        "Payment is not allowed for this order"
      );
    }

    if (order.payment_status === "PAID") {
      throw httpError(409, "Order has already been paid");
    }

    if (order.payment_status === "REFUNDED") {
      throw httpError(409, "Order has already been refunded");
    }

    const activeAttempt = await findActiveAttemptForOrder(
      connection,
      orderId,
      userId
    );

    if (activeAttempt) {
      attempt = activeAttempt;
    } else {
      const amount = normalizeAmount(order.total);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw httpError(
          400,
          "Order has an invalid payment amount"
        );
      }

      const idempotencyKey = crypto.randomUUID();

      const attemptId = await createAttempt(connection, {
        orderId,
        userId,
        provider: paymentConfig.provider,
        idempotencyKey,
        amount,
        currency: paymentConfig.currency,
      });

      attempt = {
        attempt_id: attemptId,
        order_id: orderId,
        user_id: userId,
        provider: paymentConfig.provider,
        idempotency_key: idempotencyKey,
        amount,
        currency: paymentConfig.currency,
        status: "INITIATED",
        checkout_url: null,
      };

      createdNewAttempt = true;
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  // Do not call the gateway while holding database locks.
  if (attempt.status === "PENDING" && attempt.checkout_url) {
    return {
      attemptId: attempt.attempt_id,
      status: attempt.status,
      checkoutUrl: attempt.checkout_url,
      reused: true,
    };
  }

  if (!createdNewAttempt) {
    return {
      attemptId: attempt.attempt_id,
      status: attempt.status,
      checkoutUrl: attempt.checkout_url,
      message:
        "Payment attempt is being initialized. Retry shortly.",
      reused: true,
    };
  }

  try {
    const gateway = getPaymentGateway(attempt.provider);

    const checkout = await gateway.createCheckoutSession({
      attemptId: attempt.attempt_id,
      orderId: attempt.order_id,
      orderNumber: undefined,
      amount: attempt.amount,
      currency: attempt.currency,
      idempotencyKey: attempt.idempotency_key,
    });

    if (
      !checkout.checkoutUrl ||
      !checkout.gatewayReference
    ) {
      throw new Error(
        "Gateway returned an incomplete checkout session"
      );
    }

    await updateAttemptCheckout(
      attempt.attempt_id,
      checkout
    );

    return {
      attemptId: attempt.attempt_id,
      status: "PENDING",
      checkoutUrl: checkout.checkoutUrl,
    };
  } catch (error) {
    await markAttemptInitiationFailed(
      attempt.attempt_id,
      error.message
    );

    throw httpError(
      502,
      "Unable to initialize payment with the gateway"
    );
  }
}

// --------------------------------------------------
// Process Verified Gateway Event / Webhook
// --------------------------------------------------

export async function processVerifiedGatewayEvent({
  provider,
  event,
}) {
  const connection = await pool.getConnection();

  let orderConfirmationNotification = null;

  try {
    await connection.beginTransaction();

    // Record the event in the same transaction as its effects.
    // A unique provider/event ID prevents duplicate processing.
    await connection.execute(
      `INSERT INTO payment_webhook_events (
         provider,
         provider_event_id,
         attempt_id,
         event_type,
         payload
       )
       VALUES (?, ?, ?, ?, ?)`,
      [
        provider,
        event.eventId,
        event.attemptId,
        event.eventType,
        JSON.stringify(event.rawEvent ?? {}),
      ]
    );

    const attempt = await findAttemptForUpdate(
      connection,
      event.attemptId
    );

    if (!attempt || attempt.provider !== provider) {
      throw httpError(404, "Payment attempt not found");
    }

    const [orderRows] = await connection.execute(
      `SELECT
         order_id,
         order_number,
         total,
         status,
         payment_status
       FROM orders
       WHERE order_id = ?
       FOR UPDATE`,
      [attempt.order_id]
    );

    const order = orderRows[0];

    if (!order) {
      throw httpError(
        404,
        "Associated order not found"
      );
    }

    // Verify amount and currency against both the attempt and order.
    if (
      normalizeAmount(event.amount) !==
        normalizeAmount(attempt.amount) ||
      normalizeAmount(event.amount) !==
        normalizeAmount(order.total) ||
      String(event.currency).toUpperCase() !==
        String(attempt.currency).toUpperCase()
    ) {
      throw httpError(
        400,
        "Gateway amount or currency does not match the order"
      );
    }

    // Never allow a late event to reverse a final payment state.
    if (
      isFinalStatus(attempt.status) ||
      order.payment_status === "PAID"
    ) {
      await connection.execute(
        `UPDATE payment_webhook_events
         SET processing_status = 'IGNORED',
             processed_at = CURRENT_TIMESTAMP
         WHERE provider = ?
           AND provider_event_id = ?`,
        [provider, event.eventId]
      );

      await connection.commit();

      return {
        processed: false,
        duplicateState: true,
        status: attempt.status,
      };
    }

    if (
      !["SUCCEEDED", "FAILED", "CANCELLED"].includes(
        event.status
      )
    ) {
      throw httpError(
        400,
        "Unsupported payment event status"
      );
    }

    // Do not accept successful payment for cancelled orders.
    if (
      event.status === "SUCCEEDED" &&
      ["CANCELLED", "REFUNDED"].includes(order.status)
    ) {
      throw httpError(
        409,
        "Cannot complete payment for a cancelled or refunded order"
      );
    }

    // Update the payment attempt.
    await connection.execute(
      `UPDATE online_payment_attempts
       SET status = ?,
           gateway_reference = COALESCE(
             ?,
             gateway_reference
           ),
           failure_reason = ?,
           completed_at = CURRENT_TIMESTAMP
       WHERE attempt_id = ?`,
      [
        event.status,
        event.gatewayReference ?? null,
        event.status === "FAILED"
          ? "Payment failed at gateway"
          : null,
        attempt.attempt_id,
      ]
    );

    // Handle successful payment.
    if (event.status === "SUCCEEDED") {
      const [updateResult] = await connection.execute(
        `UPDATE orders
         SET payment_status = 'PAID',
             status = CASE
               WHEN status = 'PENDING' THEN 'CONFIRMED'
               ELSE status
             END
         WHERE order_id = ?
           AND payment_status = 'PENDING'`,
        [order.order_id]
      );

      // Prepare the notification only if this operation
      // actually changed the order to PAID.
      if (updateResult.affectedRows === 1) {
        orderConfirmationNotification = {
          userId: attempt.user_id,
          orderId: order.order_id,
          orderNumber: order.order_number,
        };
      }
    } else if (event.status === "FAILED") {
      // A failed attempt must not overwrite an already-paid order.
      await connection.execute(
        `UPDATE orders
         SET payment_status = 'FAILED'
         WHERE order_id = ?
           AND payment_status = 'PENDING'`,
        [order.order_id]
      );
    }

    // CANCELLED attempts do not change the order here.
    // Order cancellation should be handled by the order module.

    await connection.execute(
      `UPDATE payment_webhook_events
       SET processed_at = CURRENT_TIMESTAMP
       WHERE provider = ?
         AND provider_event_id = ?`,
      [provider, event.eventId]
    );

    // Commit payment and order changes first.
    await connection.commit();

    // Notify after commit so notification failures cannot roll
    // back a successful payment.
    if (orderConfirmationNotification) {
      try {
        await notifyOrderConfirmed(
          orderConfirmationNotification
        );
      } catch (error) {
        console.error(
          "Order confirmation notification failed:",
          error.message
        );
      }
    }

    return {
      processed: true,
      attemptId: attempt.attempt_id,
      status: event.status,
    };
  } catch (error) {
    await connection.rollback();

    // A previously committed event may be retried by the gateway.
    if (error.code === "ER_DUP_ENTRY") {
      return {
        processed: false,
        duplicateEvent: true,
      };
    }

    throw error;
  } finally {
    connection.release();
  }
}

// --------------------------------------------------
// Mock Payment (Development Only)
// --------------------------------------------------

export async function completeMockPaymentService({
  userId,
  attemptId,
  status,
}) {
  if (process.env.NODE_ENV === "production") {
    throw httpError(
      403,
      "Mock payments are disabled in production"
    );
  }

  if (
    !["SUCCEEDED", "FAILED", "CANCELLED"].includes(status)
  ) {
    throw httpError(
      400,
      "Invalid mock payment status"
    );
  }

  const attempt = await findAttemptByIdForUser(
    attemptId,
    userId
  );

  if (!attempt) {
    throw httpError(
      404,
      "Payment attempt not found"
    );
  }

  if (attempt.provider !== "mock") {
    throw httpError(
      400,
      "This is not a mock payment"
    );
  }

  const gateway = getPaymentGateway("mock");

  // This authenticated development endpoint simulates a
  // provider result; it is not a real gateway callback.
  const event = {
    eventId: `mock_event_${crypto.randomUUID()}`,
    eventType: `payment.${status.toLowerCase()}`,
    attemptId: Number(attempt.attempt_id),
    status,
    amount: Number(attempt.amount),
    currency: attempt.currency,
    gatewayReference: attempt.gateway_reference,
    rawEvent: {
      attemptId: Number(attempt.attempt_id),
      status,
      simulated: true,
    },
  };

  // Retained for future gateway adapter expansion.
  void gateway;

  return processVerifiedGatewayEvent({
    provider: "mock",
    event,
  });
}

// --------------------------------------------------
// Get Current User's Online Payments
// --------------------------------------------------

export async function getMyOnlinePaymentsService(userId) {
  return findAttemptsByUser(userId);
}

// --------------------------------------------------
// Get One Online Payment
// --------------------------------------------------

export async function getOnlinePaymentByIdService({
  userId,
  attemptId,
}) {
  const attempt = await findAttemptByIdForUser(
    attemptId,
    userId
  );

  if (!attempt) {
    throw httpError(
      404,
      "Payment attempt not found"
    );
  }

  return attempt;
}

// --------------------------------------------------
// Get Payments for an Order
// --------------------------------------------------

export async function getOnlinePaymentsByOrderService({
  userId,
  orderId,
}) {
  return findOrderAttempts(orderId, userId);
}
