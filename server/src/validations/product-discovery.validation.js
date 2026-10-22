
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
      return res.status(400).json({
        success: false,
        message: `Unknown search parameter: ${key}.`,
      });
    }

    if (typeof value !== "string") {
      return res.status(400).json({
        success: false,
        message: `${key} must be supplied only once as a single value.`,
      });
    }
  }

  next();
}
