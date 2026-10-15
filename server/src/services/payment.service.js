
import ApiError from "../utils/ApiError.js";
import withTransaction from "../utils/transaction.js";

import {
    findOrderForPayment,
    findPaymentByOrderId,
    createPayment,
    findPaymentByIdForOwner,
    findPaymentByOrderIdForOwner,
    findPaymentsByUser
} from "../repositories/payment.repository.js";


/*
|--------------------------------------------------------------------------
| Create COD Payment
|--------------------------------------------------------------------------
*/

export const createPaymentService = async (
    orderId,
    userId,
    paymentData
) => {
    const method = paymentData.method;

    if (method !== "COD") {
        throw new ApiError(
            400,
            "Only cash on delivery is currently supported"
        );
    }

    const paymentId = await withTransaction(
        async (connection) => {
            const order = await findOrderForPayment(
                connection,
                orderId,
                userId
            );

            if (!order) {
                throw new ApiError(
                    404,
                    "Order not found"
                );
            }

            if (order.status === "CANCELLED") {
                throw new ApiError(
                    400,
                    "Payment cannot be created for a cancelled order"
                );
            }

            if (order.status === "REFUNDED") {
                throw new ApiError(
                    400,
                    "Payment cannot be created for a refunded order"
                );
            }

            if (order.payment_status === "PAID") {
                throw new ApiError(
                    409,
                    "This order has already been paid"
                );
            }

            const existingPayment =
                await findPaymentByOrderId(
                    connection,
                    orderId
                );

            if (existingPayment) {
                if (
                    existingPayment.method === "COD" &&
                    existingPayment.status === "PENDING"
                ) {
                    return existingPayment.payment_id;
                }

                throw new ApiError(
                    409,
                    "A payment record already exists for this order"
                );
            }

            return await createPayment(
                connection,
                {
                    order_id: order.order_id,
                    amount: order.total,
                    method: "COD",
                    status: "PENDING"
                }
            );
        }
    );

    const payment =
        await findPaymentByIdForOwner(
            paymentId,
            userId
        );

    if (!payment) {
        throw new ApiError(
            500,
            "Payment was created but could not be retrieved"
        );
    }

    return payment;
};


/*
|--------------------------------------------------------------------------
| Get Payment By ID
|--------------------------------------------------------------------------
*/

export const getPaymentByIdService = async (
    paymentId,
    userId
) => {
    const payment =
        await findPaymentByIdForOwner(
            paymentId,
            userId
        );

    if (!payment) {
        throw new ApiError(
            404,
            "Payment not found"
        );
    }

    return payment;
};


/*
|--------------------------------------------------------------------------
| Get Payment By Order ID
|--------------------------------------------------------------------------
*/

export const getPaymentByOrderIdService = async (
    orderId,
    userId
) => {
    const payment =
        await findPaymentByOrderIdForOwner(
            orderId,
            userId
        );

    if (!payment) {
        throw new ApiError(
            404,
            "Payment not found"
        );
    }

    return payment;
};


/*
|--------------------------------------------------------------------------
| Get User Payments
|--------------------------------------------------------------------------
*/

export const getUserPaymentsService = async (
    userId
) => {
    return await findPaymentsByUser(userId);
};
