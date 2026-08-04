import { Router } from "express";

import {
    register,
    login
} from "../controllers/auth.controller.js";

import validate from "../middleware/validation.middleware.js";

import {
    registerSchema,
    loginSchema
} from "../validations/auth.validation.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/

router.post(

    "/register",

    validate(registerSchema),

    register

);

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

router.post(

    "/login",

    validate(loginSchema),

    login

);

export default router;