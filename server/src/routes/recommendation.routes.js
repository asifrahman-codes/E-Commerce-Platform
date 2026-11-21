import { Router } from "express";

import * as recommendationController
  from "../controllers/recommendation.controller.js";
import authenticate from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", recommendationController.getPublicRecommendations);
router.get(
  "/personalized",
  authenticate,
  recommendationController.getPersonalizedRecommendations
);
router.get(
  "/recently-viewed",
  recommendationController.getRecentlyViewedRecommendations
);
router.get(
  "/products/:productId",
  recommendationController.getProductRecommendations
);

export default router;
