import { Router } from "express";

import {
    adjustInventory,
    getInventoryHistory
} from "../controllers/inventory.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

import validationMiddleware from "../middleware/validation.middleware.js";

import {
    adjustInventorySchema
} from "../validations/inventory.validation.js";

const router = Router();


/*
|--------------------------------------------------------------------------
| Adjust Inventory
|--------------------------------------------------------------------------
| POST /inventory/adjust
*/

router.post(
    "/adjust",

    authMiddleware,

    roleMiddleware("Admin"),

    validationMiddleware(adjustInventorySchema),

    adjustInventory
);


/*
|--------------------------------------------------------------------------
| Get Inventory History
|--------------------------------------------------------------------------
| GET /inventory/variants/:variantId
*/

router.get(
    "/variants/:variantId",

    authMiddleware,

    roleMiddleware("Admin"),

    getInventoryHistory
);


export default router;