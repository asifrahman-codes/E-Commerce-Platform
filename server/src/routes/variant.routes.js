import { Router } from "express";

import {
    createVariant,
    getVariantById,
    getVariantsByProduct,
    updateVariant,
    deleteVariant
} from "../controllers/variant.controller.js";

import {
    createVariantSchema,
    updateVariantSchema
} from "../validations/variant.validation.js";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import validationMiddleware from "../middleware/validation.middleware.js";

const router = Router();


router.post(
    "/products/:productId/variants",

    authMiddleware,

    roleMiddleware("Admin"),

    validationMiddleware(createVariantSchema),

    createVariant
);


router.get(
    "/products/:productId/variants",

    getVariantsByProduct
);

router.get(
    "/variants/:variantId",

    getVariantById
);


router.patch(
    "/variants/:variantId",

    authMiddleware,

    roleMiddleware("Admin"),

    validationMiddleware(updateVariantSchema),

    updateVariant
);

router.delete(
    "/variants/:variantId",

    authMiddleware,

    roleMiddleware("Admin"),

    deleteVariant
);


export default router;