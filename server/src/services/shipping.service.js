import { pool } from "../database/index.js";
import ApiError from "../utils/ApiError.js";

import {
  listActiveShippingMethods,
  listShippingMethods,
  findShippingMethodById,
  insertShippingMethod,
  updateShippingMethod,
  findOrderForShipment,
  insertShipment,
  findShipmentById,
  insertTrackingEvent,
  updateShipment,
  listTrackingEvents,
  listOrderShipments,
} from "../repositories/shipping.repository.js";

const allowedTransitions = {
  PENDING: ["READY", "FAILED"],
  READY: ["SHIPPED", "FAILED"],
  SHIPPED: ["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED", "RETURNED"],
  FAILED: ["READY", "RETURNED"],
  DELIVERED: [],
  RETURNED: [],
};

function estimateDeliveryDate(minDays, maxDays) {
  const date = new Date();
  // Use the maximum delivery time as a conservative estimate.
  date.setDate(date.getDate() + Number(maxDays));
  return date.toISOString().slice(0, 10);
}

export async function getAvailableShippingMethodsService() {
  return listActiveShippingMethods();
}

export async function getAllShippingMethodsService() {
  return listShippingMethods();
}

export async function createShippingMethodService(data) {
  if (data.max_delivery_days < data.min_delivery_days) {
    throw new ApiError(400, "Maximum delivery days must be >= minimum days");
  }

  try {
    const id = await insertShippingMethod(data);
    return findShippingMethodById(id);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "Shipping method code already exists");
    }
    throw error;
  }
}

export async function updateShippingMethodService(id, data) {
  const existing = await findShippingMethodById(id);

  if (!existing) {
    throw new ApiError(404, "Shipping method not found");
  }

  const merged = { ...existing, ...data };

  if (merged.max_delivery_days < merged.min_delivery_days) {
    throw new ApiError(400, "Maximum delivery days must be >= minimum days");
  }

  try {
    await updateShippingMethod(id, data);
    return findShippingMethodById(id);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "Shipping method code already exists");
    }
    throw error;
  }
}

export async function createShipmentService(data) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const order = await findOrderForShipment(
      data.order_id,
      connection,
      true
    );

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (order.payment_status !== "PAID") {
      throw new ApiError(409, "Order must be paid before shipment");
    }

    if (["CANCELLED", "REFUNDED"].includes(order.status)) {
      throw new ApiError(409, "Cancelled or refunded orders cannot be shipped");
    }

    const method = await findShippingMethodById(
      data.shipping_method_id,
      connection
    );

    if (!method || Number(method.is_active) !== 1) {
      throw new ApiError(400, "Shipping method is unavailable");
    }

    // Prevent accidentally creating duplicate shipments for the same order.
    // If you later support split shipments, replace this policy with an
    // order-item allocation model.
    const [existing] = await connection.execute(
      `SELECT shipment_id
       FROM shipments
       WHERE order_id = ?
       LIMIT 1
       FOR UPDATE`,
      [data.order_id]
    );

    if (existing.length > 0) {
      throw new ApiError(409, "A shipment already exists for this order");
    }

    const estimatedDate = estimateDeliveryDate(
      method.min_delivery_days,
      method.max_delivery_days
    );

    const shipmentId = await insertShipment(
      { ...data, estimated_delivery_date: estimatedDate },
      connection
    );

    await insertTrackingEvent(
      shipmentId,
      {
        status: "PENDING",
        description: "Shipment created",
      },
      connection
    );

    await connection.commit();

    return getShipmentTrackingService(shipmentId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateShipmentStatusService(shipmentId, data) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const shipment = await findShipmentById(
      shipmentId,
      connection,
      true
    );

    if (!shipment) {
      throw new ApiError(404, "Shipment not found");
    }

    if (shipment.status !== data.status) {
      const nextStates = allowedTransitions[shipment.status] ?? [];

      if (!nextStates.includes(data.status)) {
        throw new ApiError(
          409,
          `Cannot change shipment status from ${shipment.status} to ${data.status}`
        );
      }
    }

    await updateShipment(shipmentId, data, connection);

    // Add an event for every submitted status update, including a repeated
    // status if the operator is recording a new location or carrier scan.
    await insertTrackingEvent(
      shipmentId,
      {
        status: data.status,
        location: data.location,
        description: data.description,
      },
      connection
    );

    // Synchronize the order's broad fulfillment status.
    if (data.status === "SHIPPED" || data.status === "IN_TRANSIT") {
      await connection.execute(
        `UPDATE orders
         SET status = 'SHIPPED'
         WHERE order_id = ?
           AND status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED')`,
        [shipment.order_id]
      );
    }

    if (data.status === "DELIVERED") {
      // Don't mark an order delivered while another shipment is unfinished.
      const [unfinished] = await connection.execute(
        `SELECT shipment_id
         FROM shipments
         WHERE order_id = ?
           AND shipment_id <> ?
           AND status <> 'DELIVERED'
         LIMIT 1`,
        [shipment.order_id, shipmentId]
      );

      if (unfinished.length === 0) {
        await connection.execute(
          `UPDATE orders
           SET status = 'DELIVERED'
           WHERE order_id = ?
             AND status IN ('SHIPPED', 'PROCESSING', 'CONFIRMED')`,
          [shipment.order_id]
        );
      }
    }

    await connection.commit();
    return getShipmentTrackingService(shipmentId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getShipmentTrackingService(shipmentId) {
  const shipment = await findShipmentById(shipmentId);

  if (!shipment) {
    throw new ApiError(404, "Shipment not found");
  }

  const events = await listTrackingEvents(shipmentId);

  return { shipment, events };
}

export async function getCustomerOrderShipmentsService(orderId, userId) {
  const order = await findOrderForShipment(orderId);

  if (!order || Number(order.user_id) !== Number(userId)) {
    // Do not reveal whether another user's order exists.
    throw new ApiError(404, "Order not found");
  }

  const shipments = await listOrderShipments(orderId);

  const result = await Promise.all(
    shipments.map(async (shipment) => ({
      ...shipment,
      events: await listTrackingEvents(shipment.shipment_id),
    }))
  );

  return result;
}
