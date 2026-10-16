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

import authenticate from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.middleware.js";

const router = Router();

// Customer: estimate checkout pricing.
router.post(
    "/preview",
    authenticate,
    validate(previewPricingSchema),
    previewPricingController
);

// Admin: view pricing policy.
router.get(
    "/settings",
    authenticate,
    authorizeRoles("ADMIN"),
    getPricingSettingsController
);

// Admin: update pricing policy.
router.patch(
    "/settings",
    authenticate,
    authorizeRoles("ADMIN"),
    validate(updatePricingSettingsSchema),
    updatePricingSettingsController
);

export default router;