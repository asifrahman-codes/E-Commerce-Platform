import ApiError from "../utils/ApiError.js";

import {
    findAllOrders,
    findAdminOrderById
} from "../repositories/admin-order.repository.js";


const ALLOWED_ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED"
];


const ALLOWED_PAYMENT_STATUSES = [
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED"
];


/*
|--------------------------------------------------------------------------
| Get All Orders
|--------------------------------------------------------------------------
*/

export const getAdminOrdersService = async (filters) => {

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;

    if (
        !Number.isSafeInteger(page) ||
        page < 1 ||
        !Number.isSafeInteger(limit) ||
        limit < 1 ||
        limit > 100
    ) {
        throw new ApiError(400, "Invalid pagination parameters");
    }

    const status = filters.status || "";
    const paymentStatus = filters.payment_status || "";

    if (
        status &&
        !ALLOWED_ORDER_STATUSES.includes(status)
    ) {
        throw new ApiError(400, "Invalid order status");
    }

    if (
        paymentStatus &&
        !ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)
    ) {
        throw new ApiError(400, "Invalid payment status");
    }

    const result = await findAllOrders({
        page,
        limit,
        search: String(filters.search || "").trim(),
        status,
        payment_status: paymentStatus
    });

    return {
        orders: result.orders,
        pagination: {
            page,
            limit,
            total: result.total,
            total_pages: Math.ceil(result.total / limit)
        }
    };

};


/*
|--------------------------------------------------------------------------
| Get Order Details
|--------------------------------------------------------------------------
*/

export const getAdminOrderDetailsService = async (orderId) => {

    const id = Number(orderId);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new ApiError(400, "Invalid order ID");
    }

    const order = await findAdminOrderById(id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    return order;

};