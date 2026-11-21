
import { Router } from "express";

import {
  compareProducts,
  searchProducts,
} from "../controllers/product-discovery.controller.js";

import {
  validateProductSearchQuery,
} from "../validations/product-discovery.validation.js";

const router = Router();

// Public product discovery endpoint.
router.get("/compare", compareProducts);

router.get(
  "/search",
  validateProductSearchQuery,
  searchProducts
);

export default router;
