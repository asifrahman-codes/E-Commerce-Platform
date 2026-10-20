import { getPaymentGateway } from "../utils/gateways/payment-gateway.factory.js";

import { processVerifiedGatewayEvent } from "../services/online-payment.service.js";

export async function mockPaymentWebhookController(
  req,
  res,
  next
) {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    const gateway = getPaymentGateway("mock");

    // The gateway verifies the raw request body and its signature.
    const event = await gateway.verifyWebhook(req);

    const result = await processVerifiedGatewayEvent({
      provider: "mock",
      event,
    });

    return res.status(200).json({
      success: true,
      message: "Webhook received",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}