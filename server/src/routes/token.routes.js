import { Router } from "express";

import {

    refreshToken,

    logoutUser

} from "../controllers/token.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

import validate from "../middleware/validation.middleware.js";

import {

    refreshTokenSchema,

    logoutSchema

} from "../validations/token.validation.js";

const router = Router();

router.post(

    "/refresh",

    validate(refreshTokenSchema),

    refreshToken

);

router.post(

    "/logout",

    authMiddleware,

    validate(logoutSchema),

    logoutUser

);

export default router;