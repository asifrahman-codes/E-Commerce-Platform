import { Router } from "express";

import { register } from "../controllers/auth.controller.js";

import validate from "../middleware/validation.middleware.js";

import { registerSchema } from "../validations/auth.validation.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Register Routes
|--------------------------------------------------------------------------
*/

router.post(
    "/register",
    validate(registerSchema),
    register
);

export default router;