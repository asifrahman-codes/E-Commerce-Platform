import {
    createOrderService,
    getOrderByIdService,
    getUserOrdersService,
    cancelOrderService
} from "../services/order.service.js";


/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/

export const createOrderController = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.user_id;


        const order =
            await createOrderService(
                userId,
                req.body
            );


        return res.status(201).json({

            success: true,

            message:
                "Order created successfully",

            data: order

        });

    } catch (error) {

        next(error);

    }

};


/*
|--------------------------------------------------------------------------
| Get Order By ID
|--------------------------------------------------------------------------
*/

export const getOrderByIdController = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.user_id;


        const orderId =
            Number(req.params.orderId);


        const order =
            await getOrderByIdService(
                orderId,
                userId
            );


        return res.status(200).json({

            success: true,

            message:
                "Order retrieved successfully",

            data: order

        });

    } catch (error) {

        next(error);

    }

};


/*
|--------------------------------------------------------------------------
| Get User Orders
|--------------------------------------------------------------------------
*/

export const getUserOrdersController = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.user_id;


        const orders =
            await getUserOrdersService(
                userId
            );


        return res.status(200).json({

            success: true,

            message:
                "Orders retrieved successfully",

            data: orders

        });

    } catch (error) {

        next(error);

    }

};


/*
|--------------------------------------------------------------------------
| Cancel Order
|--------------------------------------------------------------------------
*/

export const cancelOrderController = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.user_id;


        const orderId =
            Number(req.params.orderId);


        const order =
            await cancelOrderService(
                orderId,
                userId
            );


        return res.status(200).json({

            success: true,

            message:
                "Order cancelled successfully",

            data: order

        });

    } catch (error) {

        next(error);

    }

};