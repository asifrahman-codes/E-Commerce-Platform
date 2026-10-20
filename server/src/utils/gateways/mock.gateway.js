import crypto from "node:crypto";
import paymentConfig from "../../config/payment.config.js";
import { PaymentGateway } from "./payment-gateway.interface.js";

export class MockPaymentGateway extends PaymentGateway {
  async createCheckoutSession(payment) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Mock gateway is disabled in production");
    }

    return {
      provider: "mock",
      gatewayReference: `mock_${payment.attemptId}`,
      checkoutUrl:
        `${paymentConfig.appUrl}/mock-payment` +
        `?attemptId=${payment.attemptId}`,
      status: "PENDING",
    };
  }

  async verifyWebhook(req) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Mock webhook is disabled in production");
    }

    const signature = req.headers["x-mock-signature"];
    const rawBody = req.body;

    if (!Buffer.isBuffer(rawBody)) {
      throw new Error("Webhook raw body is required");
    }

    if (!signature || !paymentConfig.mockSecret) {
      throw new Error("Missing mock webhook signature configuration");
    }

    const expectedSignature = crypto
      .createHmac("sha256", paymentConfig.mockSecret)
      .update(rawBody)
      .digest("hex");

    const supplied = Buffer.from(String(signature));
    const expected = Buffer.from(expectedSignature);

    if (
      supplied.length !== expected.length ||
      !crypto.timingSafeEqual(supplied, expected)
    ) {
      throw new Error("Invalid mock webhook signature");
    }

    const event = JSON.parse(rawBody.toString("utf8"));

    if (
      !event.eventId ||
      !event.attemptId ||
      !["SUCCEEDED", "FAILED", "CANCELLED"].includes(event.status)
    ) {
      throw new Error("Invalid mock webhook payload");
    }

    return {
      eventId: String(event.eventId),
      eventType: `payment.${event.status.toLowerCase()}`,
      attemptId: Number(event.attemptId),
      status: event.status,
      amount: Number(event.amount),
      currency: String(event.currency).toUpperCase(),
      gatewayReference: event.gatewayReference
        ? String(event.gatewayReference)
        : null,
      rawEvent: event,
    };
  }
}