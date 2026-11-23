import { Router } from "express";

import {
    chatWithShoppingAssistant,
} from "../controllers/ai-shopping-assistant.controller.js";

import {
    getProductReviewSummary,
} from "../controllers/ai-review-summary.controller.js";

import * as semanticSearchController from "../controllers/semantic-search.controller.js";

import authenticate from "../middleware/auth.middleware.js";

import authorize from "../middleware/role.middleware.js";

import {
    aiAssistantLimiter,
} from "../middleware/rate-limit.middleware.js";

import {
    validateAssistantRequest,
} from "../validations/ai.validation.js";

import {
    getInventoryInsights,
} from "../controllers/ai-inventory.controller.js";

import {
    chatWithAdminAssistant as chatWithAdminChatAssistant,
} from "../controllers/ai-admin-chat.controller.js";

import {
    validateAdminChat,
} from "../validations/ai-admin-chat.validation.js";

import {
    generateContent,
} from "../controllers/ai-content.controller.js";

import {
    validateAIContentRequest,
} from "../validations/ai-content.validation.js";

const router = Router();

// ----------------------------------------
// AI SHOPPING ASSISTANT
// ----------------------------------------

router.post(
    "/assistant",
    aiAssistantLimiter,
    validateAssistantRequest,
    chatWithShoppingAssistant
);

// ----------------------------------------
// AI PRODUCT REVIEW SUMMARY
// ----------------------------------------

router.get(
    "/products/:productId/review-summary",
    aiAssistantLimiter,
    getProductReviewSummary
);

// ----------------------------------------
// SEMANTIC PRODUCT SEARCH
// ----------------------------------------

router.get(
    "/search",
    aiAssistantLimiter,
    semanticSearchController.semanticSearch
);

// ----------------------------------------
// ADMIN: SEMANTIC INDEX MANAGEMENT
// ----------------------------------------

router.post(
    "/semantic-search/index",
    authenticate,
    authorize("admin"),
    semanticSearchController.indexProducts
);

router.get(
    "/semantic-search/statistics",
    authenticate,
    authorize("admin"),
    semanticSearchController.getIndexStatistics
);

// ----------------------------------------
// ADMIN AI BUSINESS INTELLIGENCE
// ----------------------------------------

router.post(
    "/admin/assistant",
    authenticate,
    authorize("admin"),
    aiAssistantLimiter,
    validateAdminChat,
    chatWithAdminChatAssistant
);

// ADMIN: AI INVENTORY INTELLIGENCE

router.get(
    "/admin/inventory-insights",
    authenticate,
    authorize("admin"),
    aiAssistantLimiter,
    getInventoryInsights
);

// ADMIN: NATURAL LANGUAGE BUSINESS ASSISTANT

router.post(
    "/admin/chat",
    authenticate,
    authorize("admin"),
    aiAssistantLimiter,
    validateAdminChat,
    chatWithAdminChatAssistant
);

// ADMIN: AI CONTENT GENERATION

router.post(
    "/admin/generate-content",
    authenticate,
    authorize("admin"),
    aiAssistantLimiter,
    validateAIContentRequest,
    generateContent
);

export default router;