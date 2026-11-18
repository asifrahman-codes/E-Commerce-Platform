import { Router } from "express";

import {
    getMyProfile,
    updateMyProfile,
    changeMyPassword,
} from "../controllers/user.controller.js";

import authenticate from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);
router.patch("/me/password", changeMyPassword);

export default router;