import ApiError from "../utils/ApiError.js";
import withTransaction from "../utils/transaction.js";

import {
    createOrder,
    createOrderItem,
    findOrderWithItems,
    findOrdersByUser,
    updateOrderStatus
} from "../repositories/order.repository.js";

import {
    findCartByUserId,
    getCartWithItems,
    clearCartWithTransaction
} from "../repositories/cart.repository.js";

import {
    getVariantForUpdate,
    updateVariantStockWithTransaction,
    createInventoryTransactionWithTransaction,
    restoreVariantStockWithTransaction
} from "../repositories/inventory.repository.js";

import {
    findAddressByUserId
} from "../repositories/address.repository.js";

import {
    getPricingSettingsForUpdate
} from "../repositories/pricing.repository.js";

import {
    calculateOrderPricing
} from "../utils/pricing.js";

import {
    validateCouponForOrder
} from "./coupon.service.js";

import {
    createCouponUsage
} from "../repositories/coupon.repository.js";


/*
|--------------------------------------------------------------------------
| Generate Order Number
|--------------------------------------------------------------------------
*/

const generateOrderNumber = () => {

    const timestamp =
        Date.now()
            .toString()
            .slice(-8);

    const random =
        Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase();

    return `ORD-${timestamp}-${random}`;
};


/*
|--------------------------------------------------------------------------
| Validate Cart
|--------------------------------------------------------------------------
*/

const getValidCart = async (userId) => {

    const cart =
        await findCartByUserId(userId);


    if (!cart) {

        throw new ApiError(
            400,
            "Cart is empty"
        );

    }


    const cartRows =
        await getCartWithItems(
            cart.cart_id
        );


    const items =
        cartRows.filter(
            (item) =>
                item.cart_item_id !== null
        );


    if (items.length === 0) {

        throw new ApiError(
            400,
            "Cart is empty"
        );

    }


    return {
        cart,
        items
    };

};


/*
|--------------------------------------------------------------------------
| Calculate Item Price
|--------------------------------------------------------------------------
*/

const calculateItemPrice = (item) => {

    const productPrice =
        Number(item.product_price);


    const priceAdjustment =
        Number(
            item.price_adjustment || 0
        );


    return productPrice + priceAdjustment;

};


/*
|--------------------------------------------------------------------------
| Calculate Subtotal
|--------------------------------------------------------------------------
*/

const calculateSubtotal = (items) => {

    return items.reduce(
        (subtotal, item) => {

            const unitPrice =
                calculateItemPrice(item);


            const itemTotal =
                unitPrice *
                Number(item.quantity);


            return subtotal + itemTotal;

        },
        0
    );

};


/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/

export const createOrderService = async (
    userId,
    orderData
) => {

    const {
        address_id,
        coupon_code = ""
    } = orderData;


    /*
    |--------------------------------------------------------------------------
    | Validate Address Ownership
    |--------------------------------------------------------------------------
    */

    const address =
        await findAddressByUserId(
            address_id,
            userId
        );


    if (!address) {

        throw new ApiError(
            400,
            "Invalid address"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Get Cart
    |--------------------------------------------------------------------------
    */

    const {
        cart,
        items
    } = await getValidCart(userId);


    /*
    |--------------------------------------------------------------------------
    | Calculate Subtotal
    |--------------------------------------------------------------------------
    */

    const subtotal =
        calculateSubtotal(items);


    /*
    |--------------------------------------------------------------------------
    | Temporary Pricing
    |--------------------------------------------------------------------------
    |
    | Coupon, shipping and tax will be connected
    | to their respective modules later.
    |
    */

    // const discount = 0;

    // const shipping = 0;

    // const tax = 0;


    // const total =
    //     subtotal -
    //     discount +
    //     shipping +
    //     tax;


    /*
    |--------------------------------------------------------------------------
    | Generate Order Number
    |--------------------------------------------------------------------------
    */

    const orderNumber =
        generateOrderNumber();


    /*
    |--------------------------------------------------------------------------
    | Database Transaction
    |--------------------------------------------------------------------------
    */

    const orderId =
        await withTransaction(
            async (connection) => {

                /*
                |--------------------------------------------------------------------------
                | Locked Variants
                |--------------------------------------------------------------------------
                */

                const lockedVariants =
                    new Map();


                /*
                |--------------------------------------------------------------------------
                | Lock And Validate All Variants
                |--------------------------------------------------------------------------
                */

                for (const item of items) {

                    const variant =
                        await getVariantForUpdate(
                            connection,
                            item.variant_id
                        );


                    if (!variant) {

                        throw new ApiError(
                            404,
                            `Variant ${item.variant_id} not found`
                        );

                    }


                    if (
                        variant.status !==
                        "ACTIVE"
                    ) {

                        throw new ApiError(
                            400,
                            `${item.product_name} is no longer available`
                        );

                    }


                    if (
                        Number(variant.stock) <
                        Number(item.quantity)
                    ) {

                        throw new ApiError(
                            400,
                            `Insufficient stock for ${item.product_name}`
                        );

                    }


                    lockedVariants.set(
                        Number(item.variant_id),
                        variant
                    );

                }


                /*
                |--------------------------------------------------------------------------
                | Create Order
                |--------------------------------------------------------------------------
                */

                const newOrderId =
                    await createOrder(
                        connection,
                        {
                            user_id: userId,
                            address_id,
                            coupon_id: null,
                            order_number: orderNumber,
                            subtotal,
                            discount,
                            shipping,
                            tax,
                            total
                        }
                    );


                /*
                |--------------------------------------------------------------------------
                | Create Order Items
                |--------------------------------------------------------------------------
                */

                for (const item of items) {

                    const variant =
                        lockedVariants.get(
                            Number(item.variant_id)
                        );


                    /*
                    |--------------------------------------------------------------------------
                    | Calculate Current Variant Price
                    |--------------------------------------------------------------------------
                    */

                    const unitPrice =
                        Number(item.product_price) +
                        Number(
                            item.price_adjustment || 0
                        );


                    const totalPrice =
                        unitPrice *
                        Number(item.quantity);


                    await createOrderItem(
                        connection,
                        {
                            order_id: newOrderId,
                            variant_id: item.variant_id,
                            product_name:
                                item.product_name,
                            sku: item.sku,
                            unit_price: unitPrice,
                            quantity: item.quantity,
                            total_price: totalPrice
                        }
                    );


                    /*
                    |--------------------------------------------------------------------------
                    | Reduce Stock
                    |--------------------------------------------------------------------------
                    */

                    const newStock =
                        Number(variant.stock) -
                        Number(item.quantity);


                    await updateVariantStockWithTransaction(
                        connection,
                        item.variant_id,
                        newStock
                    );


                    /*
                    |--------------------------------------------------------------------------
                    | Record Inventory Transaction
                    |--------------------------------------------------------------------------
                    */

                    await createInventoryTransactionWithTransaction(
                        connection,
                        {
                            variant_id:
                                item.variant_id,

                            quantity_change:
                                -Number(item.quantity),

                            transaction_type:
                                "SALE",

                            reference_id:
                                newOrderId,

                            notes:
                                "Stock reduced for order"
                        }
                    );

                }


                /*
                |--------------------------------------------------------------------------
                | Clear Cart
                |--------------------------------------------------------------------------
                */

                await clearCartWithTransaction(
                    connection,
                    cart.cart_id
                );


                /*
                |--------------------------------------------------------------------------
                | Return Order ID
                |--------------------------------------------------------------------------
                */

                return newOrderId;

            }
        );


    /*
    |--------------------------------------------------------------------------
    | Get Created Order
    |--------------------------------------------------------------------------
    */

    const order =
        await findOrderWithItems(
            orderId
        );


    return order;

};


/*
|--------------------------------------------------------------------------
| Get Order By ID
|--------------------------------------------------------------------------
*/

export const getOrderByIdService = async (
    orderId,
    userId
) => {

    const order =
        await findOrderWithItems(
            orderId
        );


    if (!order) {

        throw new ApiError(
            404,
            "Order not found"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Ownership Check
    |--------------------------------------------------------------------------
    */

    if (
        Number(order.user_id) !==
        Number(userId)
    ) {

        throw new ApiError(
            403,
            "You are not allowed to access this order"
        );

    }


    return order;

};


/*
|--------------------------------------------------------------------------
| Get User Orders
|--------------------------------------------------------------------------
*/

export const getUserOrdersService = async (
    userId
) => {

    return await findOrdersByUser(
        userId
    );

};


/*
|--------------------------------------------------------------------------
| Cancel Order
|--------------------------------------------------------------------------
*/

export const cancelOrderService = async (
    orderId,
    userId
) => {

    /*
    |--------------------------------------------------------------------------
    | Find Order
    |--------------------------------------------------------------------------
    */

    const order =
        await findOrderWithItems(
            orderId
        );


    if (!order) {

        throw new ApiError(
            404,
            "Order not found"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Ownership Check
    |--------------------------------------------------------------------------
    */

    if (
        Number(order.user_id) !==
        Number(userId)
    ) {

        throw new ApiError(
            403,
            "You are not allowed to cancel this order"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Status Check
    |--------------------------------------------------------------------------
    */

    if (
        ![
            "PENDING",
            "CONFIRMED"
        ].includes(order.status)
    ) {

        throw new ApiError(
            400,
            "This order cannot be cancelled"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Transaction
    |--------------------------------------------------------------------------
    */

    await withTransaction(
        async (connection) => {

            /*
            |--------------------------------------------------------------------------
            | Restore Stock For Every Order Item
            |--------------------------------------------------------------------------
            */

            for (const item of order.items) {

                /*
                |--------------------------------------------------------------------------
                | Lock Variant
                |--------------------------------------------------------------------------
                */

                const variant =
                    await getVariantForUpdate(
                        connection,
                        item.variant_id
                    );


                if (!variant) {

                    throw new ApiError(
                        404,
                        `Variant ${item.variant_id} not found`
                    );

                }


                /*
                |--------------------------------------------------------------------------
                | Restore Stock
                |--------------------------------------------------------------------------
                */

                await restoreVariantStockWithTransaction(
                    connection,
                    item.variant_id,
                    Number(item.quantity)
                );


                /*
                |--------------------------------------------------------------------------
                | Record RETURN Inventory Transaction
                |--------------------------------------------------------------------------
                */

                await createInventoryTransactionWithTransaction(
                    connection,
                    {
                        variant_id:
                            item.variant_id,

                        quantity_change:
                            Number(item.quantity),

                        transaction_type:
                            "RETURN",

                        reference_id:
                            orderId,

                        notes:
                            "Stock restored after order cancellation"
                    }
                );

            }


            /*
            |--------------------------------------------------------------------------
            | Update Order Status
            |--------------------------------------------------------------------------
            */

            await updateOrderStatus(
                connection,
                orderId,
                "CANCELLED"
            );

        }
    );


    /*
    |--------------------------------------------------------------------------
    | Return Updated Order
    |--------------------------------------------------------------------------
    */

    return await findOrderWithItems(
        orderId
    );

};