import crypto from "node:crypto";
import {pool} from "../database/index.js";
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
        throw httpError(400, "Order has an invalid payment amount");
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

  // Do not call the external gateway while holding database locks.
  if (attempt.status === "PENDING" && attempt.checkout_url) {
    return {
      attemptId: attempt.attempt_id,
      status: attempt.status,
      checkoutUrl: attempt.checkout_url,
      reused: true,
    };
  }

  if (!createdNewAttempt) {
    // Another request may be creating the checkout session.
    // Do not create a second active attempt.
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
      throw new Error("Gateway returned an incomplete checkout session");
    }

    await updateAttemptCheckout(attempt.attempt_id, checkout);

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

export async function processVerifiedGatewayEvent({
  provider,
  event,
}) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Store the event inside the same transaction as its effects.
    // A repeated provider event ID is rejected by the unique index.
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
      throw httpError(404, "Associated order not found");
    }

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

    // A late failure/cancel event must never reverse a successful payment.
    if (
      isFinalStatus(attempt.status) ||
      order.payment_status === "PAID"
    ) {
      await connection.execute(
        `UPDATE payment_webhook_events
         SET processing_status = 'IGNORED',
             processed_at = CURRENT_TIMESTAMP
         WHERE provider = ? AND provider_event_id = ?`,
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
      !["SUCCEEDED", "FAILED", "CANCELLED"].includes(event.status)
    ) {
      throw httpError(400, "Unsupported payment event status");
    }

    // Never accept a success event for an already cancelled order.
    if (
      event.status === "SUCCEEDED" &&
      ["CANCELLED", "REFUNDED"].includes(order.status)
    ) {
      throw httpError(
        409,
        "Cannot complete payment for a cancelled or refunded order"
      );
    }

    await connection.execute(
      `UPDATE online_payment_attempts
       SET status = ?,
           gateway_reference = COALESCE(?, gateway_reference),
           failure_reason = ?,
           completed_at = CURRENT_TIMESTAMP
       WHERE attempt_id = ?`,
      [
        event.status,
        event.gatewayReference,
        event.status === "FAILED"
          ? "Payment failed at gateway"
          : null,
        attempt.attempt_id,
      ]
    );

    if (event.status === "SUCCEEDED") {
      await connection.execute(
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
    } else if (event.status === "FAILED") {
      // A failed attempt does not overwrite an already paid order.
      await connection.execute(
        `UPDATE orders
         SET payment_status = 'FAILED'
         WHERE order_id = ?
           AND payment_status = 'PENDING'`,
        [order.order_id]
      );
    }

    await connection.execute(
      `UPDATE payment_webhook_events
       SET processed_at = CURRENT_TIMESTAMP
       WHERE provider = ? AND provider_event_id = ?`,
      [provider, event.eventId]
    );

    await connection.commit();

    return {
      processed: true,
      attemptId: attempt.attempt_id,
      status: event.status,
    };
  } catch (error) {
    await connection.rollback();

    // If the same event was already committed, it is safe to acknowledge
    // the retry without processing its effects again.
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

export async function completeMockPaymentService({
  userId,
  attemptId,
  status,
}) {
  if (process.env.NODE_ENV === "production") {
    throw httpError(403, "Mock payments are disabled in production");
  }

  if (!["SUCCEEDED", "FAILED", "CANCELLED"].includes(status)) {
    throw httpError(400, "Invalid mock payment status");
  }

  const attempt = await findAttemptByIdForUser(
    attemptId,
    userId
  );

  if (!attempt) {
    throw httpError(404, "Payment attempt not found");
  }

  if (attempt.provider !== "mock") {
    throw httpError(400, "This is not a mock payment");
  }

  const gateway = getPaymentGateway("mock");

  // This development-only endpoint is authenticated and scoped to the
  // owner's attempt. It simulates a provider result; it is not a real
  // gateway callback.
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

  // Keep the gateway reference available for later adapter expansion.
  void gateway;

  return processVerifiedGatewayEvent({
    provider: "mock",
    event,
  });
}

export async function getMyOnlinePaymentsService(userId) {
  return findAttemptsByUser(userId);
}

export async function getOnlinePaymentByIdService({
  userId,
  attemptId,
}) {
  const attempt = await findAttemptByIdForUser(
    attemptId,
    userId
  );

  if (!attempt) {
    throw httpError(404, "Payment attempt not found");
  }

  return attempt;
}

export async function getOnlinePaymentsByOrderService({
  userId,
  orderId,
}) {
  return findOrderAttempts(orderId, userId);
}