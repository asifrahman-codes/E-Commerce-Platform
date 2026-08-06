import { Router } from "express";

import upload from "../middleware/upload.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

import {

    uploadProductImages,

    getProductImages,

    deleteProductImage,

    setPrimaryImage

} from "../controllers/productImage.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

router.get(

    "/products/:id/images",

    getProductImages

);

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

router.post(

    "/products/:id/images",

    authMiddleware,

    authorize("Admin"),

    upload.array("images", 5),

    uploadProductImages

);

router.delete(

    "/products/images/:imageId",

    authMiddleware,

    authorize("Admin"),

    deleteProductImage

);

router.patch(

    "/products/images/:imageId/primary",

    authMiddleware,

    authorize("Admin"),

    setPrimaryImage

);

export default router;