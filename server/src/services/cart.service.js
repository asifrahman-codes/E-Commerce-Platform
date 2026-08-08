import ApiError from "../utils/ApiError.js";

import {
    findCartByUserId,
    createCart,
    findCartItem,
    findCartItemById,
    addCartItem,
    updateCartItem,
    deleteCartItem,
    clearCart,
    getCartWithItems
} from "../repositories/cart.repository.js";

import {
    findVariantById
} from "../repositories/variant.repository.js";


/*
|--------------------------------------------------------------------------
| Get Or Create Cart
|--------------------------------------------------------------------------
*/

const getOrCreateCart = async (userId) => {

    let cart = await findCartByUserId(userId);

    if (!cart) {

        await createCart(userId);

        cart = await findCartByUserId(userId);

        if (!cart) {

            throw new ApiError(
                500,
                "Failed to create cart"
            );

        }
    }

    return cart;
};


/*
|--------------------------------------------------------------------------
| Add Item To Cart
|--------------------------------------------------------------------------
*/

export const addItemToCartService = async (
    userId,
    variantId,
    quantity
) => {

    const cart = await getOrCreateCart(userId);


    /*
    |--------------------------------------------------------------------------
    | Find Variant
    |--------------------------------------------------------------------------
    */

    const variant = await findVariantById(variantId);

    if (!variant) {

        throw new ApiError(
            404,
            "Product variant not found"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Check Variant Status
    |--------------------------------------------------------------------------
    */

    if (variant.status !== "ACTIVE") {

        throw new ApiError(
            400,
            "This product variant is not available"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Check Stock
    |--------------------------------------------------------------------------
    */

    if (quantity > Number(variant.stock)) {

        throw new ApiError(
            400,
            `Only ${variant.stock} item(s) are available in stock`
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Check Existing Cart Item
    |--------------------------------------------------------------------------
    */

    const existingItem =
        await findCartItem(
            cart.cart_id,
            variantId
        );


    if (existingItem) {

        const newQuantity =
            Number(existingItem.quantity) +
            Number(quantity);


        if (newQuantity > Number(variant.stock)) {

            throw new ApiError(
                400,
                `Only ${variant.stock} item(s) are available in stock`
            );

        }


        await updateCartItem(
            existingItem.cart_item_id,
            newQuantity
        );

    } else {

        await addCartItem({

            cartId: cart.cart_id,

            variantId,

            quantity

        });

    }


    return await getCartService(userId);

};


/*
|--------------------------------------------------------------------------
| Get Cart
|--------------------------------------------------------------------------
*/

export const getCartService = async (
    userId
) => {

    const cart = await getOrCreateCart(userId);

    const rows =
        await getCartWithItems(
            cart.cart_id
        );


    /*
    |--------------------------------------------------------------------------
    | Empty Cart
    |--------------------------------------------------------------------------
    */

    if (
        rows.length === 0 ||
        rows[0].cart_item_id === null
    ) {

        return {

            cart_id: cart.cart_id,

            user_id: cart.user_id,

            items: [],

            subtotal: 0,

            total_items: 0

        };

    }


    /*
    |--------------------------------------------------------------------------
    | Format Cart Items
    |--------------------------------------------------------------------------
    */

    const items = rows.map((item) => {

        const unitPrice =
            Number(item.product_price) +
            Number(item.price_adjustment);


        const quantity =
            Number(item.quantity);


        const itemSubtotal =
            unitPrice * quantity;


        return {

            cart_item_id: item.cart_item_id,

            variant_id: item.variant_id,

            product_id: item.product_id,

            product_name: item.product_name,

            sku: item.sku,

            size: item.size,

            color: item.color,

            quantity,

            unit_price: unitPrice,

            item_subtotal: itemSubtotal,

            stock: Number(item.stock),

            variant_status: item.variant_status

        };

    });


    /*
    |--------------------------------------------------------------------------
    | Calculate Totals
    |--------------------------------------------------------------------------
    */

    const subtotal = items.reduce(
        (total, item) =>
            total + item.item_subtotal,
        0
    );


    const totalItems = items.reduce(
        (total, item) =>
            total + item.quantity,
        0
    );


    return {

        cart_id: cart.cart_id,

        user_id: cart.user_id,

        items,

        subtotal,

        total_items: totalItems

    };

};


/*
|--------------------------------------------------------------------------
| Update Cart Item
|--------------------------------------------------------------------------
*/

export const updateCartItemService = async (
    userId,
    cartItemId,
    quantity
) => {

    const cart = await getOrCreateCart(userId);

    const cartItem =
        await findCartItemById(
            cartItemId
        );

    if (!cartItem) {

        throw new ApiError(
            404,
            "Cart item not found"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Make Sure Item Belongs To User's Cart
    |--------------------------------------------------------------------------
    */

    if (
        Number(cartItem.cart_id) !==
        Number(cart.cart_id)
    ) {

        throw new ApiError(
            403,
            "You cannot modify this cart item"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Find Variant
    |--------------------------------------------------------------------------
    */

    const variant =
        await findVariantById(
            cartItem.variant_id
        );


    if (!variant) {

        throw new ApiError(
            404,
            "Product variant not found"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Check Variant Status
    |--------------------------------------------------------------------------
    */

    if (variant.status !== "ACTIVE") {

        throw new ApiError(
            400,
            "This product variant is no longer available"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Check Stock
    |--------------------------------------------------------------------------
    */

    if (
        Number(quantity) >
        Number(variant.stock)
    ) {

        throw new ApiError(
            400,
            `Only ${variant.stock} item(s) are available in stock`
        );

    }


    await updateCartItem(
        cartItemId,
        quantity
    );


    return await getCartService(userId);

};


/*
|--------------------------------------------------------------------------
| Remove Cart Item
|--------------------------------------------------------------------------
*/

export const removeCartItemService = async (
    userId,
    cartItemId
) => {

    const cart = await getOrCreateCart(userId);


    const cartItem =
        await findCartItemById(
            cartItemId
        );


    if (!cartItem) {

        throw new ApiError(
            404,
            "Cart item not found"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Ownership Check
    |--------------------------------------------------------------------------
    */

    if (
        Number(cartItem.cart_id) !==
        Number(cart.cart_id)
    ) {

        throw new ApiError(
            403,
            "You cannot remove this cart item"
        );

    }


    await deleteCartItem(
        cartItemId
    );


    return await getCartService(userId);

};


/*
|--------------------------------------------------------------------------
| Clear Cart
|--------------------------------------------------------------------------
*/

export const clearCartService = async (
    userId
) => {

    const cart = await getOrCreateCart(userId);


    await clearCart(
        cart.cart_id
    );


    return {

        cart_id: cart.cart_id,

        user_id: cart.user_id,

        items: [],

        subtotal: 0,

        total_items: 0

    };

};