import { Router } from "express";

import {
    register,
    login,
    getMe
} from "../controllers/auth.controller.js";

import validate from "../middleware/validation.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rate-limit.middleware.js";

import {
    registerSchema,
    loginSchema
} from "../validations/auth.validation.js";

const router = Router();

router.post(
    "/register",
    authLimiter,
    validate(registerSchema),
    register
);

router.post(
    "/login",
    authLimiter,
    validate(loginSchema),
    login
);

// Current authenticated user (used by the frontend to restore a session).
router.get(
    "/me",
    authMiddleware,
    getMe
);

export default router;
