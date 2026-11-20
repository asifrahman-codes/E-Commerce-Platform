import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

import * as controller from "../controllers/admin-product.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorize("admin"));

router.get("/", controller.getProducts);

router.get("/:productId", controller.getProductById);

router.post("/", controller.createProduct);

router.patch("/:productId", controller.updateProduct);

router.patch(
    "/:productId/status",
    controller.updateProductStatus
);

export default router;