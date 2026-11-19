import {
    getAdminOrdersService,
    getAdminOrderDetailsService
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