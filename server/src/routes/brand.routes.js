import { Router } from "express";

import {

    createBrand,

    getAllBrands,

    getBrandById,

    updateBrand,

    deleteBrand

} from "../controllers/brand.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";

import {

    createBrandSchema,

    updateBrandSchema

} from "../validations/brand.validation.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get(

    "/",

    getAllBrands

);

router.get(

    "/:id",

    getBrandById

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

    validate(createBrandSchema),

    createBrand

);

router.put(

    "/:id",

    authMiddleware,

    authorize("Admin"),

    validate(updateBrandSchema),

    updateBrand

);

router.delete(

    "/:id",

    authMiddleware,

    authorize("Admin"),

    deleteBrand

);

export default router;