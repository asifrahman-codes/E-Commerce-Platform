import { Router } from "express";

import {

    createProduct,

    getAllProducts,

    getProductById,

    updateProduct,

    deleteProduct

} from "../controllers/product.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";

import {

    createProductSchema,

    updateProductSchema

} from "../validations/product.validation.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    getAllProducts
);

router.get(
    "/:id",
    getProductById
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
    validate(createProductSchema),
    createProduct
);

router.put(
    "/:id",
    authMiddleware,
    authorize("Admin"),
    validate(updateProductSchema),
    updateProduct
);

router.delete(
    "/:id",
    authMiddleware,
    authorize("Admin"),
    deleteProduct
);

export default router;