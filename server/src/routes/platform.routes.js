import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import * as controller from "../controllers/platform.controller.js";

const router = Router();

router.get("/bundles", controller.getPublicBundles);
router.post("/bundles", authMiddleware, authorizeRoles("ADMIN"), controller.createBundle);

router.post("/back-in-stock", controller.subscribeBackInStock);

router.post("/newsletter/subscribe", controller.subscribeNewsletter);
router.post("/newsletter/unsubscribe", controller.unsubscribeNewsletter);

router.post("/wishlist/share", authMiddleware, controller.createWishlistShare);
router.get("/wishlist/shared/:token", controller.getWishlistShare);

router.post("/referrals/code", authMiddleware, controller.createReferralCode);
router.post("/referrals/apply", authMiddleware, controller.applyReferral);

router.get("/campaigns", authMiddleware, authorizeRoles("ADMIN"), controller.listCampaigns);
router.post("/campaigns", authMiddleware, authorizeRoles("ADMIN"), controller.createCampaign);

router.get("/admin/store-settings", authMiddleware, authorizeRoles("ADMIN"), controller.getStoreSettings);
router.get("/admin/store-settings/:key", authMiddleware, authorizeRoles("ADMIN"), controller.getStoreSettings);
router.put("/admin/store-settings", authMiddleware, authorizeRoles("ADMIN"), controller.updateStoreSettings);
router.get("/admin/audit-logs", authMiddleware, authorizeRoles("ADMIN"), controller.getAuditLogs);
router.get("/admin/customer-segments", authMiddleware, authorizeRoles("ADMIN"), controller.getCustomerSegments);
router.get("/admin/inventory-forecast", authMiddleware, authorizeRoles("ADMIN"), controller.getInventoryForecast);
router.get("/admin/reports/sales.csv", authMiddleware, authorizeRoles("ADMIN"), controller.exportSalesCsv);
router.get("/admin/reports/sales.xls", authMiddleware, authorizeRoles("ADMIN"), controller.exportSalesExcel);

export default router;
