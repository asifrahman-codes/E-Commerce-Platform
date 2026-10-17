
import {
  getAvailableShippingMethodsService,
  getAllShippingMethodsService,
  createShippingMethodService,
  updateShippingMethodService,
  createShipmentService,
  updateShipmentStatusService,
  getShipmentTrackingService,
  getCustomerOrderShipmentsService,
} from "../services/shipping.service.js";

export async function getAvailableShippingMethodsController(req, res, next) {
  try {
    const data = await getAvailableShippingMethodsService();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getAllShippingMethodsController(req, res, next) {
  try {
    const data = await getAllShippingMethodsService();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createShippingMethodController(req, res, next) {
  try {
    const data = await createShippingMethodService(req.body);
    res.status(201).json({
      success: true,
      message: "Shipping method created",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateShippingMethodController(req, res, next) {
  try {
    const data = await updateShippingMethodService(
      Number(req.params.shippingMethodId),
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Shipping method updated",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createShipmentController(req, res, next) {
  try {
    const data = await createShipmentService(req.body);
    res.status(201).json({
      success: true,
      message: "Shipment created",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateShipmentStatusController(req, res, next) {
  try {
    const data = await updateShipmentStatusService(
      Number(req.params.shipmentId),
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Shipment updated",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getShipmentTrackingController(req, res, next) {
  try {
    const data = await getShipmentTrackingService(
      Number(req.params.shipmentId)
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerOrderShipmentsController(req, res, next) {
  try {
    const data = await getCustomerOrderShipmentsService(
      Number(req.params.orderId),
      req.user.user_id
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
