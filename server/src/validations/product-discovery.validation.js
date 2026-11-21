
import ApiError from "../utils/ApiError.js";

const ALLOWED_QUERY_PARAMS = new Set([
  "q",
  "category_id",
  "brand_id",
  "min_price",
  "max_price",
  "in_stock",
  "sort",
  "page",
  "limit",
]);

export function validateProductSearchQuery(req, res, next) {
  for (const [key, value] of Object.entries(req.query)) {
    if (!ALLOWED_QUERY_PARAMS.has(key)) {
      return next(
        new ApiError(400, `Unknown search parameter: ${key}.`)
      );
    }

    if (typeof value !== "string") {
      return next(
        new ApiError(
          400,
          `${key} must be supplied only once as a single value.`
        )
      );
    }
  }

  return next();
}
