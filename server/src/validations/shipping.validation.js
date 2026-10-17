
import Joi from "joi";

const trackingStatuses = [
  "PENDING",
  "READY",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "RETURNED",
];

export const createShippingMethodSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9_-]+$/)
    .max(50)
    .required(),

  name: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().max(255).allow("", null),

  min_delivery_days: Joi.number().integer().min(0).required(),
  max_delivery_days: Joi.number().integer().min(0).required(),

  fee: Joi.number().min(0).precision(2).required(),
  free_shipping_threshold: Joi.number()
    .min(0)
    .precision(2)
    .allow(null),

  is_active: Joi.number().valid(0, 1).default(1),
}).custom((value, helpers) => {
  if (value.max_delivery_days < value.min_delivery_days) {
    return helpers.error("any.invalid");
  }
  return value;
});

export const updateShippingMethodSchema =
  createShippingMethodSchema.fork(
    [
      "code",
      "name",
      "min_delivery_days",
      "max_delivery_days",
      "fee",
    ],
    (schema) => schema.optional()
  ).min(1);

export const createShipmentSchema = Joi.object({
  order_id: Joi.number().integer().positive().required(),
  shipping_method_id: Joi.number().integer().positive().required(),
  carrier: Joi.string().trim().max(100).allow("", null),
  tracking_number: Joi.string().trim().max(150).allow("", null),
  tracking_url: Joi.string().uri().max(500).allow("", null),
});

export const updateShipmentStatusSchema = Joi.object({
  status: Joi.string().valid(...trackingStatuses).required(),
  location: Joi.string().trim().max(255).allow("", null),
  description: Joi.string().trim().max(500).required(),
  carrier: Joi.string().trim().max(100).allow("", null),
  tracking_number: Joi.string().trim().max(150).allow("", null),
  tracking_url: Joi.string().uri().max(500).allow("", null),
  estimated_delivery_date: Joi.date().iso().allow(null),
});
