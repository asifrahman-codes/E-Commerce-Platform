
import { Router } from "express";

import * as reviewController from "../controllers/review.controller.js";

import  authenticate  from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

import {
  validateCreateReview,
  validateUpdateReview,
  validateReviewId,
  validateModeration,
} from "../validations/review.validation.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// GET /api/reviews/products/:productId
// Get approved reviews and the rating summary for a product.
router.get(
  "/products/:productId",
  reviewController.getProductReviews
);

/*
|--------------------------------------------------------------------------
| Customer Routes
|--------------------------------------------------------------------------
*/

// POST /api/reviews
// Create a review.
router.post(
  "/",
  authenticate,
  validateCreateReview,
  reviewController.createReview
);

// GET /api/reviews/my-reviews
// Get the authenticated customer's reviews.
router.get(
  "/my-reviews",
  authenticate,
  reviewController.getMyReviews
);

// PATCH /api/reviews/:reviewId
// Update the authenticated customer's own review.
router.patch(
  "/:reviewId",
  authenticate,
  validateReviewId,
  validateUpdateReview,
  reviewController.updateReview
);

// DELETE /api/reviews/:reviewId
// Delete the authenticated customer's own review.
router.delete(
  "/:reviewId",
  authenticate,
  validateReviewId,
  reviewController.deleteReview
);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

// GET /api/reviews/admin
// Get reviews awaiting moderation or otherwise available for moderation.
router.get(
  "/admin",
  authenticate,
  authorize("admin"),
  reviewController.getReviewsForModeration
);

// PATCH /api/reviews/admin/:reviewId/moderate
// Approve, reject, or otherwise moderate a review.
router.patch(
  "/admin/:reviewId/moderate",
  authenticate,
  authorize("admin"),
  validateReviewId,
  validateModeration,
  reviewController.moderateReview
);

export default router;
