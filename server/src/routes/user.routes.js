import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";

import {
    getMyProfile,
    updateMyProfile,
    changeMyPassword,
    deactivateMyAccount,
} from "../controllers/user.controller.js";

import {
    updateProfileSchema,
    changePasswordSchema,
    deactivateAccountSchema,
} from "../validations/user.validation.js";

const router = Router();

router.use(authMiddleware);

router.get("/me", getMyProfile);

router.patch(
    "/me",
    validate(updateProfileSchema),
    updateMyProfile
);

router.patch(
    "/me/password",
    validate(changePasswordSchema),
    changeMyPassword
);

router.post(
    "/me/deactivate",
    validate(deactivateAccountSchema),
    deactivateMyAccount
);

export default router;
