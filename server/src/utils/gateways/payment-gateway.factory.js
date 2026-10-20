import paymentConfig from "../../config/payment.config.js";
import { MockPaymentGateway } from "./mock.gateway.js";

export function getPaymentGateway(provider = paymentConfig.provider) {
  switch (provider.toLowerCase()) {
    case "mock":
      if (process.env.NODE_ENV === "production") {
        throw new Error("Mock gateway cannot run in production");
      }

      return new MockPaymentGateway();

    case "payfast":
      throw new Error(
        "PayFast adapter has not been implemented. " +
        "Use its verified official API documentation first."
      );

    default:
      throw new Error(`Unsupported payment provider: ${provider}`);
  }
}