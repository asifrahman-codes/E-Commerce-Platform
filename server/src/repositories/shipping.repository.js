
import {pool} from "../database/index.js";

export async function listActiveShippingMethods(connection = pool) {
  const [rows] = await connection.execute(
    `SELECT shipping_method_id, code, name, description,
            min_delivery_days, max_delivery_days, fee,
            free_shipping_threshold
     FROM shipping_methods
     WHERE is_active = 1
     ORDER BY fee ASC, shipping_method_id ASC`
  );

  return rows;
}

export async function listShippingMethods(connection = pool) {
  const [rows] = await connection.execute(
    `SELECT *
     FROM shipping_methods
     ORDER BY shipping_method_id DESC`
  );

  return rows;
}

export async function findShippingMethodById(
  shippingMethodId,
  connection = pool
) {
  const [rows] = await connection.execute(
    `SELECT *
     FROM shipping_methods
     WHERE shipping_method_id = ?
     LIMIT 1`,
    [shippingMethodId]
  );

  return rows[0] ?? null;
}

export async function insertShippingMethod(data, connection = pool) {
  const [result] = await connection.execute(
    `INSERT INTO shipping_methods (
       code, name, description,
       min_delivery_days, max_delivery_days,
       fee, free_shipping_threshold, is_active
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.code,
      data.name,
      data.description ?? null,
      data.min_delivery_days,
      data.max_delivery_days,
      data.fee,
      data.free_shipping_threshold ?? null,
      data.is_active ?? 1,
    ]
  );

  return result.insertId;
}

export async function updateShippingMethod(
  shippingMethodId,
  data,
  connection = pool
) {
  const allowedFields = [
    "code",
    "name",
    "description",
    "min_delivery_days",
    "max_delivery_days",
    "fee",
    "free_shipping_threshold",
    "is_active",
  ];

  const fields = [];
  const values = [];

  for (const field of allowedFields) {
    if (Object.hasOwn(data, field)) {
      fields.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (!fields.length) return false;

  values.push(shippingMethodId);

  const [result] = await connection.execute(
    `UPDATE shipping_methods
     SET ${fields.join(", ")}
     WHERE shipping_method_id = ?`,
    values
  );

  return result.affectedRows > 0;
}

export async function findOrderForShipment(
  orderId,
  connection = pool,
  lock = false
) {
  const [rows] = await connection.execute(
    `SELECT order_id, user_id, status, payment_status
     FROM orders
     WHERE order_id = ?
     ${lock ? "FOR UPDATE" : ""}
     LIMIT 1`,
    [orderId]
  );

  return rows[0] ?? null;
}

export async function insertShipment(data, connection) {
  const [result] = await connection.execute(
    `INSERT INTO shipments (
       order_id, shipping_method_id, carrier,
       tracking_number, tracking_url, status,
       estimated_delivery_date
     ) VALUES (?, ?, ?, ?, ?, 'PENDING', ?)`,
    [
      data.order_id,
      data.shipping_method_id,
      data.carrier ?? null,
      data.tracking_number ?? null,
      data.tracking_url ?? null,
      data.estimated_delivery_date ?? null,
    ]
  );

  return result.insertId;
}

export async function findShipmentById(
  shipmentId,
  connection = pool,
  lock = false
) {
  const [rows] = await connection.execute(
    `SELECT s.*, o.user_id, o.order_number, o.status AS order_status,
            o.payment_status,
            sm.code AS shipping_method_code,
            sm.name AS shipping_method_name
     FROM shipments s
     JOIN orders o ON o.order_id = s.order_id
     JOIN shipping_methods sm
       ON sm.shipping_method_id = s.shipping_method_id
     WHERE s.shipment_id = ?
     ${lock ? "FOR UPDATE" : ""}
     LIMIT 1`,
    [shipmentId]
  );

  return rows[0] ?? null;
}

export async function insertTrackingEvent(
  shipmentId,
  data,
  connection
) {
  const [result] = await connection.execute(
    `INSERT INTO shipment_tracking_events (
       shipment_id, status, location, description, event_time
     ) VALUES (?, ?, ?, ?, ?)`,
    [
      shipmentId,
      data.status,
      data.location ?? null,
      data.description,
      data.event_time ?? new Date(),
    ]
  );

  return result.insertId;
}

export async function updateShipment(
  shipmentId,
  data,
  connection
) {
  const [result] = await connection.execute(
    `UPDATE shipments
     SET status = ?,
         carrier = COALESCE(?, carrier),
         tracking_number = COALESCE(?, tracking_number),
         tracking_url = COALESCE(?, tracking_url),
         estimated_delivery_date =
           COALESCE(?, estimated_delivery_date),
         shipped_at = CASE
           WHEN ? = 'SHIPPED' AND shipped_at IS NULL
           THEN CURRENT_TIMESTAMP
           ELSE shipped_at
         END,
         delivered_at = CASE
           WHEN ? = 'DELIVERED' AND delivered_at IS NULL
           THEN CURRENT_TIMESTAMP
           ELSE delivered_at
         END
     WHERE shipment_id = ?`,
    [
      data.status,
      data.carrier ?? null,
      data.tracking_number ?? null,
      data.tracking_url ?? null,
      data.estimated_delivery_date ?? null,
      data.status,
      data.status,
      shipmentId,
    ]
  );

  return result.affectedRows > 0;
}

export async function listTrackingEvents(shipmentId, connection = pool) {
  const [rows] = await connection.execute(
    `SELECT tracking_event_id, status, location, description,
            event_time, created_at
     FROM shipment_tracking_events
     WHERE shipment_id = ?
     ORDER BY event_time ASC, tracking_event_id ASC`,
    [shipmentId]
  );

  return rows;
}

export async function listOrderShipments(orderId, connection = pool) {
  const [rows] = await connection.execute(
    `SELECT s.*, sm.code AS shipping_method_code,
            sm.name AS shipping_method_name
     FROM shipments s
     JOIN shipping_methods sm
       ON sm.shipping_method_id = s.shipping_method_id
     WHERE s.order_id = ?
     ORDER BY s.shipment_id DESC`,
    [orderId]
  );

  return rows;
}
