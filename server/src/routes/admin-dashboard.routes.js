import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

import {
    getOverview,
    getSalesAnalytics,
    getOrderStatusAnalytics,
    getTopProducts,
    getRecentOrders,
    getCustomers
} from "../controllers/admin-dashboard.controller.js";


const router = Router();

router.use(authMiddleware, authorizeRoles("ADMIN"));

router.get("/overview", getOverview);

router.get("/sales", getSalesAnalytics);

router.get("/orders", getOrderStatusAnalytics);

router.get("/top-products", getTopProducts);

router.get("/recent-orders", getRecentOrders);

router.get("/customers", getCustomers);

export default router;