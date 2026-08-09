import express from "express";

import {
    createOrderController,
    getOrderByIdController,
    getUserOrdersController,
    cancelOrderController
} from "../controllers/order.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";


const router = express.Router();


/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
| POST /api/orders
*/

router.post(
    "/",
    authMiddleware,
    createOrderController
);


/*
|--------------------------------------------------------------------------
| Get Current User Orders
|--------------------------------------------------------------------------
| GET /api/orders
*/

router.get(
    "/",
    authMiddleware,
    getUserOrdersController
);


/*
|--------------------------------------------------------------------------
| Get Order By ID
|--------------------------------------------------------------------------
| GET /api/orders/:orderId
*/

router.get(
    "/:orderId",
    authMiddleware,
    getOrderByIdController
);


/*
|--------------------------------------------------------------------------
| Cancel Order
|--------------------------------------------------------------------------
| PATCH /api/orders/:orderId/cancel
*/

router.patch(
    "/:orderId/cancel",
    authMiddleware,
    cancelOrderController
);


export default router;