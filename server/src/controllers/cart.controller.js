import {
    addItemToCartService,
    getCartService,
    updateCartItemService,
    removeCartItemService,
    clearCartService
} from "../services/cart.service.js";

import ApiResponse from "../utils/ApiResponse.js";

export const addItemToCart = async (req, res, next) => {

    try {

        const {
            variant_id,
            quantity
        } = req.body;

        const userId = req.user.user_id;

        const cart =
            await addItemToCartService(
                userId,
                variant_id,
                quantity
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                cart,
                "Item added to cart successfully"
            )
        );

    } catch (error) {

        next(error);

    }

};

export const getCart = async (req, res, next) => {

    try {

        const userId = req.user.user_id;

        const cart =
            await getCartService(userId);

        return res.status(200).json(
            new ApiResponse(
                200,
                cart,
                "Cart fetched successfully"
            )
        );

    } catch (error) {

        next(error);

    }

};

export const updateCartItem = async (
    req,
    res,
    next
) => {

    try {

        const {
            quantity
        } = req.body;

        const {
            cartItemId
        } = req.params;

        const userId = req.user.user_id;

        const cart =
            await updateCartItemService(
                userId,
                cartItemId,
                quantity
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                cart,
                "Cart item updated successfully"
            )
        );

    } catch (error) {

        next(error);

    }

};

export const removeCartItem = async (
    req,
    res,
    next
) => {

    try {

        const {
            cartItemId
        } = req.params;

        const userId = req.user.user_id;

        const cart =
            await removeCartItemService(
                userId,
                cartItemId
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                cart,
                "Cart item removed successfully"
            )
        );

    } catch (error) {

        next(error);

    }

};


export const clearCart = async (
    req,
    res,
    next
) => {

    try {

        const userId = req.user.user_id;

        const cart =
            await clearCartService(userId);

        return res.status(200).json(
            new ApiResponse(
                200,
                cart,
                "Cart cleared successfully"
            )
        );

    } catch (error) {

        next(error);

    }

};