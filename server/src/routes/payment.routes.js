
import { Router } from "express";

import {
    createPaymentController,
    getPaymentByIdController,
    getPaymentByOrderIdController,
    getUserPaymentsController
} from "../controllers/payment.controller.js";

import {
    createPaymentSchema
} from "../validations/payment.validation.js";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";

const router = Router();


/*
|--------------------------------------------------------------------------
| Customer Payment Routes
|--------------------------------------------------------------------------
*/

// GET /api/payments
router.get(
    "/",
    authMiddleware,
    getUserPaymentsController
);

// POST /api/payments/orders/:orderId
router.post(
    "/orders/:orderId",
    authMiddleware,
    validate(createPaymentSchema),
    createPaymentController
);

// GET /api/payments/orders/:orderId
router.get(
    "/orders/:orderId",
    authMiddleware,
    getPaymentByOrderIdController
);

// GET /api/payments/:paymentId
router.get(
    "/:paymentId",
    authMiddleware,
    getPaymentByIdController
);

export default router;
