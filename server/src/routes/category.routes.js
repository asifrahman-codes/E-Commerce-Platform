import { Router } from "express";

import {

    createCategory,

    getAllCategories,

    getCategoryById,

    updateCategory,

    deleteCategory

} from "../controllers/category.controller.js";

import validate from "../middleware/validation.middleware.js";

import authMiddleware from "../middleware/auth.middleware.js";

import authorize from "../middleware/role.middleware.js";

import {

    createCategorySchema,

    updateCategorySchema

} from "../validations/category.validation.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get(

    "/",

    getAllCategories

);

router.get(

    "/:id",

    getCategoryById

);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

router.post(

    "/",

    authMiddleware,

    authorize("Admin"),

    validate(createCategorySchema),

    createCategory

);

router.put(

    "/:id",

    authMiddleware,

    authorize("Admin"),

    validate(updateCategorySchema),

    updateCategory

);

router.delete(

    "/:id",

    authMiddleware,

    authorize("Admin"),

    deleteCategory

);

export default router;