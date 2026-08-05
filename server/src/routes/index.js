import { Router } from "express";

import authRoutes from "./auth.routes.js";
import tokenRoutes from "./token.routes.js";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
import brandRoutes from "./brand.routes.js";
import productRoutes from "./product.routes.js";
import cartRoutes from "./cart.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import orderRoutes from "./order.routes.js";
import paymentRoutes from "./payment.routes.js";
import couponRoutes from "./coupon.routes.js";
import reviewRoutes from "./review.routes.js";
import healthRoutes from "./health.routes.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

router.use("/health", healthRoutes);

router.use("/auth", authRoutes);

router.use(
    "/token",
    tokenRoutes
);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/coupons", couponRoutes);
router.use("/reviews", reviewRoutes);

export default router;