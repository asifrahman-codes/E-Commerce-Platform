import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  initiateOnlinePaymentController,
  completeMockPaymentController,
  getMyOnlinePaymentsController,
  getOnlinePaymentByIdController,
  getOnlinePaymentsByOrderController,
} from "../controllers/online-payment.controller.js";

import {
  mockPaymentWebhookController,
} from "../controllers/online-payment.webhook.controller.js";

const router = Router();

// Authenticated customer endpoints
router.post(
  "/orders/:orderId/checkout",
  authMiddleware,
  initiateOnlinePaymentController
);

router.get(
  "/mine",
  authMiddleware,
  getMyOnlinePaymentsController
);

router.get(
  "/attempts/:attemptId",
  authMiddleware,
  getOnlinePaymentByIdController
);

router.get(
  "/orders/:orderId",
  authMiddleware,
  getOnlinePaymentsByOrderController
);

// Development only. Never expose simulated payment completion in production.
router.post(
  "/mock/attempts/:attemptId/complete",
  authMiddleware,
  completeMockPaymentController
);

// Webhook authentication is the provider's signature, not customer JWT.
router.post(
  "/webhook/mock",
  mockPaymentWebhookController
);

export default router;