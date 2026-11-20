import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

import * as controller from "../controllers/admin-inventory.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorize("admin"));

router.get("/dashboard", controller.getDashboard);

router.get("/low-stock", controller.getLowStock);

router.get("/history", controller.getHistory);

router.post("/adjust", controller.adjustStock);

export default router;