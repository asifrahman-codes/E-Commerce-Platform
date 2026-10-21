
import { Router } from "express";

import * as wishlistController from "../controllers/wishlist.controller.js";

import authenticate from "../middleware/auth.middleware.js";

import {
  validateAddWishlistItem,
  validateWishlistProductId,
} from "../validations/wishlist.validation.js";

const router = Router();

// All wishlist operations require authentication.
router.use(authenticate);

// Add a product.
router.post(
  "/",
  validateAddWishlistItem,
  wishlistController.addToWishlist
);

// Get the current customer's wishlist.
router.get(
  "/",
  wishlistController.getMyWishlist
);

// Clear the current customer's entire wishlist.
// Keep this route before the parameterized DELETE route.
router.delete(
  "/",
  wishlistController.clearMyWishlist
);

// Remove one product.
router.delete(
  "/:productId",
  validateWishlistProductId,
  wishlistController.removeFromWishlist
);

export default router;
