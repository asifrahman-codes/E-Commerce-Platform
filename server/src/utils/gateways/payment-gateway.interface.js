export class PaymentGateway {
  async createCheckoutSession(_payment) {
    throw new Error("createCheckoutSession() must be implemented");
  }

  async verifyWebhook(_request) {
    throw new Error("verifyWebhook() must be implemented");
  }
}