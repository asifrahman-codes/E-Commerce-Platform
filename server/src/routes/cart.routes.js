import { Router } from "express";

import {
    addItemToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
} from "../controllers/cart.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

import validationMiddleware from "../middleware/validation.middleware.js";

import {
    addCartItemSchema,
    updateCartItemSchema
} from "../validations/cart.validation.js";


const router = Router();

router.get(
    "/",
    authMiddleware,
    getCart
);


router.post(
    "/items",
    authMiddleware,
    validationMiddleware(addCartItemSchema),
    addItemToCart
);

router.patch(
    "/items/:cartItemId",
    authMiddleware,
    validationMiddleware(updateCartItemSchema),
    updateCartItem
);

router.delete(
    "/items/:cartItemId",
    authMiddleware,
    removeCartItem
);

router.delete(
    "/",
    authMiddleware,
    clearCart
);


export default router;