
import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

import {
  createShippingMethodSchema,
  updateShippingMethodSchema,
  createShipmentSchema,
  updateShipmentStatusSchema,
  updateShipmentDetailsSchema,
} from "../validations/shipping.validation.js";

import {
  getAvailableShippingMethodsController,
  getAllShippingMethodsController,
  createShippingMethodController,
  updateShippingMethodController,
  createShipmentController,
  updateShipmentStatusController,
  updateShipmentDetailsController,
  getShipmentTrackingController,
  getCustomerOrderShipmentsController,
} from "../controllers/shipping.controller.js";

const router = Router();

// Public: available shipping methods for checkout.
router.get("/methods", getAvailableShippingMethodsController);

// Admin: manage shipping methods.
router.get(
  "/admin/methods",
  authenticate,
  authorizeRoles("ADMIN"),
  getAllShippingMethodsController
);

router.post(
  "/admin/methods",
  authenticate,
  authorizeRoles("ADMIN"),
  validate(createShippingMethodSchema),
  createShippingMethodController
);

router.patch(
  "/admin/methods/:shippingMethodId",
  authenticate,
  authorizeRoles("ADMIN"),
  validate(updateShippingMethodSchema),
  updateShippingMethodController
);

// Admin: create shipment after payment is confirmed.
router.post(
  "/admin/shipments",
  authenticate,
  authorizeRoles("ADMIN"),
  validate(createShipmentSchema),
  createShipmentController
);

// Customer: see shipments attached to their own order.
router.get(
  "/orders/:orderId/shipments",
  authenticate,
  getCustomerOrderShipmentsController
);

// Admin: update shipment carrier/tracking/delivery date details.
router.patch(
  "/admin/shipments/:shipmentId",
  authenticate,
  authorizeRoles("ADMIN"),
  validate(updateShipmentDetailsSchema),
  updateShipmentDetailsController
);

// Admin: record carrier scans and status changes.
router.patch(
  "/admin/shipments/:shipmentId/status",
  authenticate,
  authorizeRoles("ADMIN"),
  validate(updateShipmentStatusSchema),
  updateShipmentStatusController
);

// Tracking lookup by internal shipment ID; requires authentication here.
router.get(
  "/shipments/:shipmentId/tracking",
  authenticate,
  getShipmentTrackingController
);

export default router;
