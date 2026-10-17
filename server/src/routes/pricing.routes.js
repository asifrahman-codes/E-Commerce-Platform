import { Router } from "express";

import {
    previewPricingController,
    getPricingSettingsController,
    updatePricingSettingsController
} from "../controllers/pricing.controller.js";

import {
    updatePricingSettingsSchema,
    previewPricingSchema
} from "../validations/pricing.validation.js";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = Router();

// Customer: estimate checkout pricing.
router.post(
    "/preview",
    authMiddleware,
    validate(previewPricingSchema),
    previewPricingController
);

// Admin: view pricing policy.
router.get(
    "/settings",
    authMiddleware,
    authorizeRoles("ADMIN"),
    getPricingSettingsController
);

// Admin: update pricing policy.
router.patch(
    "/settings",
    authMiddleware,
    authorizeRoles("ADMIN"),
    validate(updatePricingSettingsSchema),
    updatePricingSettingsController
);

export default router;