
function badRequest(res, message) {
  return res.status(400).json({
    success: false,
    message,
  });
}

function isPositiveInteger(value) {
  return /^[1-9]\d*$/.test(String(value ?? ""));
}

export function validateAddWishlistItem(req, res, next) {
  if (!isPositiveInteger(req.body.product_id)) {
    return badRequest(
      res,
      "A valid positive product_id is required."
    );
  }

  next();
}

export function validateWishlistProductId(req, res, next) {
  if (!isPositiveInteger(req.params.productId)) {
    return badRequest(res, "Invalid product ID.");
  }

  next();
}
