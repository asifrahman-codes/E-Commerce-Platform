import { Router } from "express";

import {
    createCouponController,
    listCouponsController,
    getCouponController,
    updateCouponController,
    deactivateCouponController,
    validateCouponController
} from "../controllers/coupon.controller.js";

import {
    createCouponSchema,
    updateCouponSchema,
    validateCouponSchema
} from "../validations/coupon.validation.js";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = Router();

// Customer route: validate a coupon before checkout.
router.post(
    "/validate",
    authMiddleware,
    validate(validateCouponSchema),
    validateCouponController
);

// Admin routes.
router.post(
    "/",
    authMiddleware,
    authorizeRoles("ADMIN"),
    validate(createCouponSchema),
    createCouponController
);

router.get(
    "/",
    authMiddleware,
    authorizeRoles("ADMIN"),
    listCouponsController
);

router.get(
    "/:couponId",
    authMiddleware,
    authorizeRoles("ADMIN"),
    getCouponController
);

router.patch(
    "/:couponId",
    authMiddleware,
    authorizeRoles("ADMIN"),
    validate(updateCouponSchema),
    updateCouponController
);

router.patch(
    "/:couponId/deactivate",
    authMiddleware,
    authorizeRoles("ADMIN"),
    deactivateCouponController
);

export default router;