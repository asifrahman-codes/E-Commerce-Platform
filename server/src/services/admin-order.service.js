import ApiError from "../utils/ApiError.js";
import withTransaction from "../utils/transaction.js";

import {
    findAllOrders,
    findAdminOrderById,
    findOrderForAdminUpdate,
    findOrderItemsForAdminUpdate,
    findPaymentForAdminUpdate,
    updateAdminOrderStatusWithTransaction,
    updateAdminPaymentStatusWithTransaction,
    insertOrderStatusHistoryWithTransaction,
    updatePaymentRecordWithTransaction,
} from "../repositories/admin-order.repository.js";

import {
    getVariantForUpdate,
    restoreVariantStockWithTransaction,
    createInventoryTransactionWithTransaction,
} from "../repositories/inventory.repository.js";

import {
    releaseCouponUsage,
} from "../repositories/coupon.repository.js";
import {
    releaseFlashSaleUsageForOrder
} from "./flash-sale.service.js";
import {
    awardCompletedOrderPoints,
    restoreRedeemedPointsForOrder,
    reverseEarnedPointsForOrder
} from "./loyalty.service.js";

import {
    notifyOrderConfirmed,
    notifyOrderProcessing,
    notifyOrderCancelled,
    notifyOrderRefunded,
    notifyOrderDelivered,
    notifyPaymentStatusUpdated,
} from "./notification.service.js";

const ALLOWED_ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
];

const ALLOWED_PAYMENT_STATUSES = [
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
];

const VALID_ORDER_TRANSITIONS = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED", "CANCELLED"],
    DELIVERED: ["REFUNDED"],
    CANCELLED: [],
    REFUNDED: [],
};

const REFUND_UNAVAILABLE_MESSAGE =
    "A refund cannot be marked complete until a refund-capable payment provider confirms it.";

/*
|--------------------------------------------------------------------------
| Get All Orders (Admin)
|--------------------------------------------------------------------------
*/

export const getAdminOrdersService = async (filters = {}) => {
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

    const status = String(filters.status || "").trim();
    const paymentStatus = String(filters.payment_status || "").trim();
    const paymentMethod = String(filters.payment_method || "").trim();
    const sort = String(filters.sort || "newest").trim();
    const startDate = filters.start_date ? new Date(filters.start_date) : null;
    const endDate = filters.end_date ? new Date(filters.end_date) : null;

    if (status && !ALLOWED_ORDER_STATUSES.includes(status)) {
        throw new ApiError(400, "Invalid order status filter");
    }

    if (paymentStatus && !ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
        throw new ApiError(400, "Invalid payment status filter");
    }

    if (!["newest", "oldest", "amount_asc", "amount_desc"].includes(sort)) {
        throw new ApiError(400, "Invalid order sort order");
    }

    if (startDate && Number.isNaN(startDate.getTime())) {
        throw new ApiError(400, "Invalid start date");
    }

    if (endDate && Number.isNaN(endDate.getTime())) {
        throw new ApiError(400, "Invalid end date");
    }

    const result = await findAllOrders({
        page,
        limit,
        search: String(filters.search || "").trim(),
        status,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        start_date: startDate ? startDate.toISOString().slice(0, 19).replace("T", " ") : null,
        end_date: endDate ? endDate.toISOString().slice(0, 19).replace("T", " ") : null,
        sort,
    });

    return {
        orders: result.orders,
        pagination: {
            page,
            limit,
            total: result.total,
            total_pages: Math.ceil(result.total / limit) || 1,
        },
    };
};

/*
|--------------------------------------------------------------------------
| Get Order Details (Admin)
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

/*
|--------------------------------------------------------------------------
| Update Order Status (Admin) with State Machine Enforcement
|--------------------------------------------------------------------------
*/

export const updateAdminOrderStatusService = async ({
    orderId,
    status: targetStatus,
    notes = null,
    adminId,
}) => {
    const id = Number(orderId);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new ApiError(400, "Invalid order ID");
    }

    if (!ALLOWED_ORDER_STATUSES.includes(targetStatus)) {
        throw new ApiError(400, `Invalid target status: ${targetStatus}`);
    }

    if (targetStatus === "REFUNDED") {
        throw new ApiError(409, REFUND_UNAVAILABLE_MESSAGE);
    }

    let customerNotification = null;

    await withTransaction(async (connection) => {
        const order = await findOrderForAdminUpdate(connection, id);

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        const currentStatus = order.status;

        if (currentStatus === targetStatus) {
            throw new ApiError(400, `Order is already in ${targetStatus} status`);
        }

        const allowedNextStates = VALID_ORDER_TRANSITIONS[currentStatus] || [];

        if (!allowedNextStates.includes(targetStatus)) {
            throw new ApiError(
                409,
                `Cannot transition order from ${currentStatus} to ${targetStatus}. Allowed transitions: ${allowedNextStates.join(", ") || "None (terminal state)"}`
            );
        }

        // =========================================================
        // Transition: CANCELLED
        // =========================================================
        if (targetStatus === "CANCELLED") {
            const orderItems = await findOrderItemsForAdminUpdate(
                connection,
                id
            );

            for (const item of orderItems) {
                const variant = await getVariantForUpdate(connection, item.variant_id);

                if (variant) {
                    await restoreVariantStockWithTransaction(
                        connection,
                        item.variant_id,
                        Number(item.quantity)
                    );

                    await createInventoryTransactionWithTransaction(connection, {
                        variant_id: item.variant_id,
                        quantity_change: Number(item.quantity),
                        transaction_type: "RETURN",
                        reference_id: id,
                        notes: `Stock restored upon admin cancellation. Reason: ${notes || "Admin cancelled"}`,
                    });
                }
            }

            await releaseCouponUsage(connection, id);
            await releaseFlashSaleUsageForOrder(connection, id);
            await restoreRedeemedPointsForOrder(
                connection,
                id,
                order.user_id
            );
            await updateAdminOrderStatusWithTransaction(connection, id, "CANCELLED");

            await insertOrderStatusHistoryWithTransaction(connection, {
                order_id: id,
                status: "CANCELLED",
                changed_by: adminId,
                notes: notes ? `Admin cancelled: ${notes}` : "Admin cancelled order",
            });

            customerNotification = {
                type: "CANCELLED",
                userId: order.user_id,
                orderId: id,
                orderNumber: order.order_number,
            };
        }

        // =========================================================
        // Transition: REFUNDED (Return / Refund workflow)
        // =========================================================
        else if (targetStatus === "REFUNDED") {
            const orderItems = await findOrderItemsForAdminUpdate(
                connection,
                id
            );

            for (const item of orderItems) {
                const variant = await getVariantForUpdate(connection, item.variant_id);

                if (variant) {
                    await restoreVariantStockWithTransaction(
                        connection,
                        item.variant_id,
                        Number(item.quantity)
                    );

                    await createInventoryTransactionWithTransaction(connection, {
                        variant_id: item.variant_id,
                        quantity_change: Number(item.quantity),
                        transaction_type: "RETURN",
                        reference_id: id,
                        notes: `Stock restored upon admin refund. Note: ${notes || "Order refunded"}`,
                    });
                }
            }

            await releaseCouponUsage(connection, id);
            await releaseFlashSaleUsageForOrder(connection, id);
            await restoreRedeemedPointsForOrder(
                connection,
                id,
                order.user_id
            );
            await reverseEarnedPointsForOrder(
                connection,
                id,
                order.user_id
            );
            await updateAdminOrderStatusWithTransaction(connection, id, "REFUNDED");
            await updateAdminPaymentStatusWithTransaction(connection, id, "REFUNDED");
            await updatePaymentRecordWithTransaction(connection, id, "REFUNDED");

            await insertOrderStatusHistoryWithTransaction(connection, {
                order_id: id,
                status: "REFUNDED",
                changed_by: adminId,
                notes: notes ? `Order refunded: ${notes}` : "Order refunded and items returned to stock",
            });

            customerNotification = {
                type: "REFUNDED",
                userId: order.user_id,
                orderId: id,
                orderNumber: order.order_number,
            };
        }

        // =========================================================
        // Transition: CONFIRMED
        // =========================================================
        else if (targetStatus === "CONFIRMED") {
            await updateAdminOrderStatusWithTransaction(connection, id, "CONFIRMED");

            await insertOrderStatusHistoryWithTransaction(connection, {
                order_id: id,
                status: "CONFIRMED",
                changed_by: adminId,
                notes: notes || "Order confirmed by administrator",
            });

            customerNotification = {
                type: "CONFIRMED",
                userId: order.user_id,
                orderId: id,
                orderNumber: order.order_number,
            };
        }

        // =========================================================
        // Transition: PROCESSING
        // =========================================================
        else if (targetStatus === "PROCESSING") {
            await updateAdminOrderStatusWithTransaction(connection, id, "PROCESSING");

            await insertOrderStatusHistoryWithTransaction(connection, {
                order_id: id,
                status: "PROCESSING",
                changed_by: adminId,
                notes: notes || "Order is being prepared for fulfillment",
            });

            customerNotification = {
                type: "PROCESSING",
                userId: order.user_id,
                orderId: id,
                orderNumber: order.order_number,
            };
        }

        // =========================================================
        // Transition: SHIPPED
        // =========================================================
        else if (targetStatus === "SHIPPED") {
            await updateAdminOrderStatusWithTransaction(connection, id, "SHIPPED");

            await insertOrderStatusHistoryWithTransaction(connection, {
                order_id: id,
                status: "SHIPPED",
                changed_by: adminId,
                notes: notes || "Order marked as shipped",
            });
        }

        // =========================================================
        // Transition: DELIVERED
        // =========================================================
        else if (targetStatus === "DELIVERED") {
            await updateAdminOrderStatusWithTransaction(connection, id, "DELIVERED");

            // For COD orders, delivering automatically confirms payment collection
            const payment = await findPaymentForAdminUpdate(
                connection,
                id
            );

            if (payment?.payment_gateway === "COD") {
                await updateAdminPaymentStatusWithTransaction(connection, id, "PAID");
                await updatePaymentRecordWithTransaction(connection, id, "SUCCEEDED", new Date());
            }
            await awardCompletedOrderPoints(connection, id);

            await insertOrderStatusHistoryWithTransaction(connection, {
                order_id: id,
                status: "DELIVERED",
                changed_by: adminId,
                notes: notes || "Order marked as delivered",
            });

            customerNotification = {
                type: "DELIVERED",
                userId: order.user_id,
                orderId: id,
                orderNumber: order.order_number,
            };
        }
    });

    // Dispatch notification outside database transaction
    if (customerNotification) {
        try {
            if (customerNotification.type === "CONFIRMED") {
                await notifyOrderConfirmed(customerNotification);
            } else if (customerNotification.type === "PROCESSING") {
                await notifyOrderProcessing(customerNotification);
            } else if (customerNotification.type === "CANCELLED") {
                await notifyOrderCancelled(customerNotification);
            } else if (customerNotification.type === "REFUNDED") {
                await notifyOrderRefunded(customerNotification);
            } else if (customerNotification.type === "DELIVERED") {
                await notifyOrderDelivered(customerNotification);
            }
        } catch (err) {
            console.error("Order status notification failed:", err.message);
        }
    }

    return await findAdminOrderById(id);
};

/*
|--------------------------------------------------------------------------
| Update Payment Status (Admin)
|--------------------------------------------------------------------------
*/

export const updateAdminPaymentStatusService = async ({
    orderId,
    paymentStatus,
    notes = null,
    adminId,
}) => {
    const id = Number(orderId);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new ApiError(400, "Invalid order ID");
    }

    if (!ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
        throw new ApiError(400, `Invalid payment status: ${paymentStatus}`);
    }

    if (paymentStatus === "REFUNDED") {
        throw new ApiError(409, REFUND_UNAVAILABLE_MESSAGE);
    }

    let customerNotification = null;

    await withTransaction(async (connection) => {
        const order = await findOrderForAdminUpdate(connection, id);

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        if (order.payment_status === paymentStatus) {
            throw new ApiError(400, `Order payment status is already ${paymentStatus}`);
        }

        await updateAdminPaymentStatusWithTransaction(connection, id, paymentStatus);

        const paymentRowStatus =
            paymentStatus === "PAID"
                ? "SUCCEEDED"
                : paymentStatus === "REFUNDED"
                  ? "REFUNDED"
                  : paymentStatus === "FAILED"
                    ? "FAILED"
                    : "PENDING";

        const paidAt = paymentStatus === "PAID" ? new Date() : null;

        await updatePaymentRecordWithTransaction(connection, id, paymentRowStatus, paidAt);

        if (paymentStatus === "PAID" && order.status === "DELIVERED") {
            await awardCompletedOrderPoints(connection, id);
        } else if (paymentStatus === "REFUNDED") {
            await releaseCouponUsage(connection, id);
            await releaseFlashSaleUsageForOrder(connection, id);
            await restoreRedeemedPointsForOrder(connection, id, order.user_id);
            await reverseEarnedPointsForOrder(connection, id, order.user_id);
        }

        await insertOrderStatusHistoryWithTransaction(connection, {
            order_id: id,
            status: order.status,
            changed_by: adminId,
            notes: notes
                ? `Payment status updated to ${paymentStatus}: ${notes}`
                : `Payment status updated to ${paymentStatus}`,
        });

        customerNotification = {
            userId: order.user_id,
            orderId: id,
            orderNumber: order.order_number,
            paymentStatus,
        };
    });

    if (customerNotification) {
        try {
            await notifyPaymentStatusUpdated(customerNotification);
        } catch (notificationError) {
            console.error(
                "Payment status notification failed:",
                notificationError.message
            );
        }
    }

    return await findAdminOrderById(id);
};

/*
|--------------------------------------------------------------------------
| Cancel Order (Admin)
|--------------------------------------------------------------------------
*/

export const cancelAdminOrderService = async ({
    orderId,
    reason,
    notes = null,
    adminId,
}) => {
    const fullNotes = `Reason: ${reason}${notes ? ` | Notes: ${notes}` : ""}`;

    return await updateAdminOrderStatusService({
        orderId,
        status: "CANCELLED",
        notes: fullNotes,
        adminId,
    });
};
