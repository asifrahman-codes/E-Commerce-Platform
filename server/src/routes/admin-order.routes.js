import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";

import {
    getAdminOrdersController,
    getAdminOrderDetailsController
} from "../controllers/admin-order.controller.js";

import {
    adminOrdersQuerySchema
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

export default router;