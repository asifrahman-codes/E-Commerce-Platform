import { Router } from "express";
import Joi from "joi";
import authMiddleware from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
    createFlashSaleController,
    listAdminFlashSalesController,
    updateFlashSaleController
} from "../controllers/flash-sale.controller.js";

const targetSchema = Joi.object({
    product_id: Joi.number().integer().positive(),
    variant_id: Joi.number().integer().positive(),
    per_customer_limit: Joi.number().integer().positive().allow(null)
}).or("product_id", "variant_id");

const campaignSchema = Joi.object({
    title: Joi.string().trim().min(1).max(160).required(),
    description: Joi.string().allow("", null).max(2000),
    starts_at: Joi.date().iso().required(),
    ends_at: Joi.date().iso().greater(Joi.ref("starts_at")).required(),
    discount_type: Joi.string().valid("PERCENTAGE", "FIXED").required(),
    discount_value: Joi.number().positive().max(99999999.99).precision(2).required(),
    status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
    targets: Joi.array().items(targetSchema).min(1).max(100)
});

const router = Router();
router.use(authMiddleware, authorizeRoles("ADMIN"));

router.get("/", listAdminFlashSalesController);
router.post(
    "/",
    validate(campaignSchema),
    createFlashSaleController
);
router.patch(
    "/:saleId",
    validate(campaignSchema),
    updateFlashSaleController
);

export default router;
