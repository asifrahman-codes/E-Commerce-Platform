
import { Router } from "express";

import {
  chatWithShoppingAssistant,
} from "../controllers/ai-shopping-assistant.controller.js";

import {
  aiAssistantLimiter,
} from "../middleware/rate-limit.middleware.js";

import {
  validateAssistantRequest,
} from "../validations/ai.validation.js";

const router = Router();

router.post(
  "/assistant",
  aiAssistantLimiter,
  validateAssistantRequest,
  chatWithShoppingAssistant
);

export default router;
