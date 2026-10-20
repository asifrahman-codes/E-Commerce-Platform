import {
  initiateOnlinePaymentService,
  completeMockPaymentService,
  getMyOnlinePaymentsService,
  getOnlinePaymentByIdService,
  getOnlinePaymentsByOrderService,
} from "../services/online-payment.service.js";

function parsePositiveId(value, fieldName) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    const error = new Error(`Invalid ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }

  return id;
}

export async function initiateOnlinePaymentController(
  req,
  res,
  next
) {
  try {
    const orderId = parsePositiveId(
      req.params.orderId,
      "order ID"
    );

    const data = await initiateOnlinePaymentService({
      userId: req.user.user_id,
      orderId,
    });

    return res.status(201).json({
      success: true,
      message: "Online payment attempt initialized",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function completeMockPaymentController(
  req,
  res,
  next
) {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    const attemptId = parsePositiveId(
      req.params.attemptId,
      "payment attempt ID"
    );

    const { status } = req.body;

    const data = await completeMockPaymentService({
      userId: req.user.user_id,
      attemptId,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Mock payment result processed",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyOnlinePaymentsController(
  req,
  res,
  next
) {
  try {
    const data = await getMyOnlinePaymentsService(
      req.user.user_id
    );

    return res.status(200).json({
      success: true,
      message: "Online payments retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOnlinePaymentByIdController(
  req,
  res,
  next
) {
  try {
    const attemptId = parsePositiveId(
      req.params.attemptId,
      "payment attempt ID"
    );

    const data = await getOnlinePaymentByIdService({
      userId: req.user.user_id,
      attemptId,
    });

    return res.status(200).json({
      success: true,
      message: "Online payment retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOnlinePaymentsByOrderController(
  req,
  res,
  next
) {
  try {
    const orderId = parsePositiveId(
      req.params.orderId,
      "order ID"
    );

    const data = await getOnlinePaymentsByOrderService({
      userId: req.user.user_id,
      orderId,
    });

    return res.status(200).json({
      success: true,
      message: "Order payment attempts retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}