import asyncHandler from "../utils/asyncHandler.js";
import {
  getAvailableShippingMethodsService,
  getAllShippingMethodsService,
  createShippingMethodService,
  updateShippingMethodService,
  createShipmentService,
  updateShipmentStatusService,
  updateShipmentDetailsService,
  getShipmentTrackingService,
  getCustomerOrderShipmentsService,
} from "../services/shipping.service.js";

function success(res, data, message, status = 200) {
  const response = { success: true };
  if (message) response.message = message;
  response.data = data;
  return res.status(status).json(response);
}

export const getAvailableShippingMethodsController = asyncHandler(
  async (_req, res) =>
    success(res, await getAvailableShippingMethodsService())
);

export const getAllShippingMethodsController = asyncHandler(async (_req, res) =>
  success(res, await getAllShippingMethodsService())
);

export const createShippingMethodController = asyncHandler(async (req, res) =>
  success(
    res,
    await createShippingMethodService(req.body),
    "Shipping method created",
    201
  )
);

export const updateShippingMethodController = asyncHandler(async (req, res) =>
  success(
    res,
    await updateShippingMethodService(
      Number(req.params.shippingMethodId),
      req.body
    ),
    "Shipping method updated"
  )
);

export const createShipmentController = asyncHandler(async (req, res) =>
  success(
    res,
    await createShipmentService(req.body),
    "Shipment created",
    201
  )
);

export const updateShipmentStatusController = asyncHandler(async (req, res) =>
  success(
    res,
    await updateShipmentStatusService(
      Number(req.params.shipmentId),
      req.body
    ),
    "Shipment updated"
  )
);

export const updateShipmentDetailsController = asyncHandler(async (req, res) =>
  success(
    res,
    await updateShipmentDetailsService(
      Number(req.params.shipmentId),
      req.body
    ),
    "Shipment details updated"
  )
);

export const getShipmentTrackingController = asyncHandler(async (req, res) =>
  success(
    res,
    await getShipmentTrackingService(Number(req.params.shipmentId))
  )
);

export const getCustomerOrderShipmentsController = asyncHandler(
  async (req, res) =>
    success(
      res,
      await getCustomerOrderShipmentsService(
        Number(req.params.orderId),
        req.user.user_id
      )
    )
);
