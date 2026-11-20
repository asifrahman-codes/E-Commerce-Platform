import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
    getOverview,
    getSalesAnalytics,
    getOrderStatusAnalytics,
    getTopProducts,
    getRecentOrders,
    getCustomers
} from "../controllers/admin-dashboard.controller.js";


const router = Router();

// Authentication required.
// Admin authorization must also be applied here.

router.use(authMiddleware);

// Add your existing admin-role middleware here if your
// auth middleware does not already enforce administrator access.

router.get("/overview", getOverview);

router.get("/sales", getSalesAnalytics);

router.get("/orders", getOrderStatusAnalytics);

router.get("/top-products", getTopProducts);

router.get("/recent-orders", getRecentOrders);

router.get("/customers", getCustomers);

export default router;