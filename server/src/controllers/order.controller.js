import asyncHandler from "../utils/asyncHandler.js";
import {
  createOrderService,
  getOrderByIdService,
  getUserOrdersService,
  cancelOrderService,
  previewOrderService,
} from "../services/order.service.js";

function success(res, data, message, status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export const createOrderController = asyncHandler(async (req, res) =>
  success(
    res,
    await createOrderService(req.user.user_id, req.body),
    "Order created successfully",
    201
  )
);

export const getOrderByIdController = asyncHandler(async (req, res) =>
  success(
    res,
    await getOrderByIdService(
      Number(req.params.orderId),
      req.user.user_id
    ),
    "Order retrieved successfully"
  )
);

export const getUserOrdersController = asyncHandler(async (req, res) =>
  success(
    res,
    await getUserOrdersService(req.user.user_id),
    "Orders retrieved successfully"
  )
);

export const cancelOrderController = asyncHandler(async (req, res) =>
  success(
    res,
    await cancelOrderService(
      Number(req.params.orderId),
      req.user.user_id
    ),
    "Order cancelled successfully"
  )
);

export const previewOrderController = asyncHandler(async (req, res) =>
  success(
    res,
    await previewOrderService(req.user.user_id, req.body),
    "Order preview calculated"
  )
);
