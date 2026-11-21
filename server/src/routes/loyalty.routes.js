import { Router } from "express";
import Joi from "joi";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import {
    getAdminLoyaltySettingsController,
    getLoyaltyAccountController,
    getLoyaltyTransactionsController,
    updateAdminLoyaltySettingsController
} from "../controllers/loyalty.controller.js";

const router = Router();

router.get("/me", authMiddleware, getLoyaltyAccountController);
router.get(
    "/transactions",
    authMiddleware,
    getLoyaltyTransactionsController
);

router.get(
    "/admin/settings",
    authMiddleware,
    authorizeRoles("ADMIN"),
    getAdminLoyaltySettingsController
);
router.patch(
    "/admin/settings",
    authMiddleware,
    authorizeRoles("ADMIN"),
    validate(Joi.object({
        points_per_currency: Joi.number().positive().max(1000).precision(4).required(),
        currency_per_point: Joi.number().positive().max(100000).precision(4).required(),
        minimum_redemption_points: Joi.number().integer().positive().max(Number.MAX_SAFE_INTEGER).required(),
        expiry_days: Joi.number().integer().positive().max(36500).allow(null).required(),
        status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE")
    })),
    updateAdminLoyaltySettingsController
);

export default router;
