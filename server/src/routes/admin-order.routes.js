import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";

import {
    getAdminOrdersController,
    getAdminOrderDetailsController,
    updateAdminOrderStatusController,
    updateAdminPaymentStatusController,
    cancelAdminOrderController
} from "../controllers/admin-order.controller.js";

import {
    adminOrdersQuerySchema,
    updateOrderStatusSchema,
    updatePaymentStatusSchema,
    cancelAdminOrderSchema
} from "../validations/admin-order.validation.js";

const router = Router();

router.use(authMiddleware, authorizeRoles("ADMIN"));

router.get(
    "/",
    validate(adminOrdersQuerySchema),
    getAdminOrdersController
);

router.get(
    "/:orderId",
    getAdminOrderDetailsController
);

router.patch(
    "/:orderId/status",
    validate(updateOrderStatusSchema),
    updateAdminOrderStatusController
);

router.patch(
    "/:orderId/payment-status",
    validate(updatePaymentStatusSchema),
    updateAdminPaymentStatusController
);

router.post(
    "/:orderId/cancel",
    validate(cancelAdminOrderSchema),
    cancelAdminOrderController
);

export default router;