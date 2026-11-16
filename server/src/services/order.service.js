import ApiError from "../utils/ApiError.js";
import withTransaction from "../utils/transaction.js";

import {
    createOrder,
    createOrderItem,
    findOrderWithItems,
    findOrdersByUser,
    findOrderByIdForUpdate,
    updateOrderStatus
} from "../repositories/order.repository.js";

import {
    findCartByUserId,
    getCartWithItems,
    clearCartWithTransaction,
    lockCartForUpdate
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
    getPricingSettingsForUpdate,
    getActivePricingSettings
} from "../repositories/pricing.repository.js";

import {
    findPaymentByOrderIdForOwner
} from "../repositories/payment.repository.js";

import {
    calculateOrderPricing
} from "../utils/pricing.js";

import {
    validateCouponForOrder,
    validateCouponService
} from "./coupon.service.js";

import {
    createCouponUsage,
    releaseCouponUsage
} from "../repositories/coupon.repository.js";

import {
  notifyOrderCancelled,
} from "./notification.service.js";


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

    const { cart } = await getValidCart(userId);

    const orderNumber =
        generateOrderNumber();

    const orderId =
        await withTransaction(
            async (connection) => {

                // Serialise concurrent checkouts of this cart, then re-read
                // its items so a duplicate submission sees an empty cart.
                await lockCartForUpdate(
                    connection,
                    cart.cart_id
                );

                const { items } =
                    await getValidCart(userId);

                const subtotal =
                    Math.round(
                        (calculateSubtotal(items) + Number.EPSILON) * 100
                    ) / 100;

/*
                -----------------------------------------
                Lock Variants (sorted to avoid deadlocks)
                -----------------------------------------
                */

                const lockedVariants =
                    new Map();

                const sortedItems =
                    [...items].sort(
                        (a, b) =>
                            Number(a.variant_id) -
                            Number(b.variant_id)
                    );

                for (const item of sortedItems) {

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
                -----------------------------------------
                Coupon (validated on the backend only)
                -----------------------------------------
                */

                let coupon = null;
                let discount = 0;

                const code =
                    String(coupon_code || "").trim();

                if (code) {

                    const result =
                        await validateCouponForOrder(
                            connection,
                            {
                                code,
                                userId,
                                subtotal
                            }
                        );

                    coupon = result.coupon;
                    discount = result.discount;

                }

                /*
                -----------------------------------------
                Backend Pricing: shipping, tax, total
                -----------------------------------------
                */

                const settings =
                    await getPricingSettingsForUpdate(
                        connection
                    );

                const pricing =
                    calculateOrderPricing({
                        subtotal,
                        discount,
                        settings
                    });

                const newOrderId =
                    await createOrder(
                        connection,
                        {
                            user_id: userId,
                            address_id,
                            coupon_id: coupon
                                ? coupon.coupon_id
                                : null,
                            order_number: orderNumber,
                            subtotal: pricing.subtotal,
                            discount: pricing.discount,
                            shipping: pricing.shipping,
                            tax: pricing.tax,
                            total: pricing.total
                        }
                    );

                if (coupon) {

                    await createCouponUsage(
                        connection,
                        {
                            couponId: coupon.coupon_id,
                            userId,
                            orderId: newOrderId,
                            discountAmount: pricing.discount
                        }
                    );

                }

                for (const item of items) {

                    const variant =
                        lockedVariants.get(
                            Number(item.variant_id)
                        );

                    const unitPrice =
                        calculateItemPrice(item);

                    const totalPrice =
                        Math.round(
                            (unitPrice *
                            Number(item.quantity) +
                            Number.EPSILON) * 100
                        ) / 100;

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

                    const newStock =
                        Number(variant.stock) -
                        Number(item.quantity);

                    await updateVariantStockWithTransaction(
                        connection,
                        item.variant_id,
                        newStock
                    );

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

                await clearCartWithTransaction(
                    connection,
                    cart.cart_id
                );

                return newOrderId;

            }
        );

    return await findOrderWithItems(
        orderId
    );

};


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


    const [address, payment] = await Promise.all([
        findAddressByUserId(order.address_id, userId),
        findPaymentByOrderIdForOwner(orderId, userId)
    ]);

    return {
        ...order,
        address,
        payment: payment || null
    };

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

            // Re-check under a row lock so concurrent cancel/payment cannot race.
            const locked =
                await findOrderByIdForUpdate(
                    connection,
                    orderId
                );

            if (
                !locked ||
                !["PENDING", "CONFIRMED"].includes(locked.status)
            ) {

                throw new ApiError(
                    409,
                    "This order cannot be cancelled"
                );

            }

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

            await releaseCouponUsage(
                connection,
                orderId
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


/*
|--------------------------------------------------------------------------
| Checkout preview: priced entirely from the server-side cart.
| Nothing from the client except the coupon code is trusted.
|--------------------------------------------------------------------------
*/

export const previewOrderService = async (
    userId,
    { coupon_code = "" } = {}
) => {

    const { items } = await getValidCart(userId);

    const subtotal =
        Math.round(
            (calculateSubtotal(items) + Number.EPSILON) * 100
        ) / 100;

    let discount = 0;
    let coupon = null;

    const code = String(coupon_code || "").trim();

    if (code) {

        const result =
            await validateCouponService({
                code,
                userId,
                subtotal
            });

        discount = result.discount;

        coupon = {
            code: result.code,
            discount_type: result.discount_type,
            discount: result.discount
        };

    }

    const settings =
        await getActivePricingSettings();

    const pricing =
        calculateOrderPricing({
            subtotal,
            discount,
            settings
        });

    return {
        ...pricing,
        coupon,
        free_shipping_threshold:
            settings.free_shipping_threshold === null
                ? null
                : Number(settings.free_shipping_threshold),
        item_count: items.reduce(
            (sum, item) => sum + Number(item.quantity),
            0
        )
    };

};
