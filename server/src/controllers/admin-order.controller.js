import {
    getAdminOrdersService,
    getAdminOrderDetailsService,
    updateAdminOrderStatusService,
    updateAdminPaymentStatusService,
    cancelAdminOrderService
} from "../services/admin-order.service.js";


export const getAdminOrdersController = async (
    req,
    res,
    next
) => {

    try {

        const data = await getAdminOrdersService(req.query);

        return res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
            data
        });

    } catch (error) {
        next(error);
    }

};


export const getAdminOrderDetailsController = async (
    req,
    res,
    next
) => {

    try {

        const data = await getAdminOrderDetailsService(
            req.params.orderId
        );

        return res.status(200).json({
            success: true,
            message: "Order details retrieved successfully",
            data
        });

    } catch (error) {
        next(error);
    }

};

export const updateAdminOrderStatusController = async (
    req,
    res,
    next
) => {
    try {
        const data = await updateAdminOrderStatusService({
            orderId: req.params.orderId,
            status: req.body.status,
            notes: req.body.notes,
            adminId: req.user.user_id
        });

        return res.status(200).json({
            success: true,
            message: `Order status successfully updated to ${req.body.status}`,
            data
        });
    } catch (error) {
        next(error);
    }
};

export const updateAdminPaymentStatusController = async (
    req,
    res,
    next
) => {
    try {
        const data = await updateAdminPaymentStatusService({
            orderId: req.params.orderId,
            paymentStatus: req.body.payment_status,
            notes: req.body.notes,
            adminId: req.user.user_id
        });

        return res.status(200).json({
            success: true,
            message: `Order payment status successfully updated to ${req.body.payment_status}`,
            data
        });
    } catch (error) {
        next(error);
    }
};

export const cancelAdminOrderController = async (
    req,
    res,
    next
) => {
    try {
        const data = await cancelAdminOrderService({
            orderId: req.params.orderId,
            reason: req.body.reason,
            notes: req.body.notes,
            adminId: req.user.user_id
        });

        return res.status(200).json({
            success: true,
            message: "Order successfully cancelled and stock restored",
            data
        });
    } catch (error) {
        next(error);
    }
};
