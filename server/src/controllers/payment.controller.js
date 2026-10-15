
import {
    createPaymentService,
    getPaymentByIdService,
    getPaymentByOrderIdService,
    getUserPaymentsService
} from "../services/payment.service.js";


/*
|--------------------------------------------------------------------------
| Create Payment
|--------------------------------------------------------------------------
*/

export const createPaymentController = async (
    req,
    res,
    next
) => {
    try {
        const orderId = Number(req.params.orderId);
        const userId = req.user.user_id;

        if (
            !Number.isSafeInteger(orderId) ||
            orderId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const payment = await createPaymentService(
            orderId,
            userId,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Payment record created successfully",
            data: payment
        });
    } catch (error) {
        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Get Payment By ID
|--------------------------------------------------------------------------
*/

export const getPaymentByIdController = async (
    req,
    res,
    next
) => {
    try {
        const paymentId = Number(req.params.paymentId);
        const userId = req.user.user_id;

        if (
            !Number.isSafeInteger(paymentId) ||
            paymentId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment ID"
            });
        }

        const payment = await getPaymentByIdService(
            paymentId,
            userId
        );

        return res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Get Payment By Order ID
|--------------------------------------------------------------------------
*/

export const getPaymentByOrderIdController = async (
    req,
    res,
    next
) => {
    try {
        const orderId = Number(req.params.orderId);
        const userId = req.user.user_id;

        if (
            !Number.isSafeInteger(orderId) ||
            orderId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const payment =
            await getPaymentByOrderIdService(
                orderId,
                userId
            );

        return res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Get User Payments
|--------------------------------------------------------------------------
*/

export const getUserPaymentsController = async (
    req,
    res,
    next
) => {
    try {
        const payments = await getUserPaymentsService(
            req.user.user_id
        );

        return res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        next(error);
    }
};
