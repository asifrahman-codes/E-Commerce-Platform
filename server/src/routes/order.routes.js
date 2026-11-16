import express from "express";

import {
    createOrderController,
    getOrderByIdController,
    getUserOrdersController,
    cancelOrderController,
    previewOrderController
} from "../controllers/order.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
    createOrderSchema,
    cancelOrderSchema,
    previewOrderSchema
} from "../validations/order.validation.js";


const router = express.Router();


/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
| POST /api/orders
*/

router.post(
    "/preview",
    authMiddleware,
    validate(previewOrderSchema),
    previewOrderController
);

router.post(
    "/",
    authMiddleware,
    validate(createOrderSchema),
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
    validate(cancelOrderSchema),
    cancelOrderController
);


export default router;