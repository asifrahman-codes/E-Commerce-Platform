
function badRequest(res, message) {
  return res.status(400).json({
    success: false,
    message,
  });
}

function validPositiveId(value) {
  return /^[1-9]\d*$/.test(String(value ?? ""));
}

function validRating(value) {
  const rating = Number(value);

  return (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== "" &&
    Number.isInteger(rating) &&
    rating >= 1 &&
    rating <= 5
  );
}

function validReviewText(title, comment) {
  if (
    title !== undefined &&
    title !== null &&
    (
      typeof title !== "string" ||
      title.trim().length > 150
    )
  ) {
    return false;
  }

  if (
    comment !== undefined &&
    comment !== null &&
    (
      typeof comment !== "string" ||
      comment.length > 5000
    )
  ) {
    return false;
  }

  return Boolean(
    (typeof title === "string" && title.trim()) ||
    (typeof comment === "string" && comment.trim())
  );
}

export function validateCreateReview(req, res, next) {
  if (!validPositiveId(req.body.product_id)) {
    return badRequest(res, "A valid product_id is required.");
  }

  if (!validRating(req.body.rating)) {
    return badRequest(
      res,
      "Rating must be an integer between 1 and 5."
    );
  }

  if (!validReviewText(req.body.title, req.body.comment)) {
    return badRequest(
      res,
      "Provide a title or comment with valid lengths."
    );
  }

  next();
}

export function validateUpdateReview(req, res, next) {
  if (!validRating(req.body.rating)) {
    return badRequest(
      res,
      "Rating must be an integer between 1 and 5."
    );
  }

  if (!validReviewText(req.body.title, req.body.comment)) {
    return badRequest(
      res,
      "Provide a title or comment with valid lengths."
    );
  }

  next();
}

export function validateReviewId(req, res, next) {
  if (!validPositiveId(req.params.reviewId)) {
    return badRequest(res, "Invalid review ID.");
  }

  next();
}

export function validateModeration(req, res, next) {
  const allowedStatuses = ["APPROVED", "REJECTED", "HIDDEN"];
  const status = String(req.body.status ?? "").toUpperCase();

  if (!allowedStatuses.includes(status)) {
    return badRequest(
      res,
      "Status must be APPROVED, REJECTED, or HIDDEN."
    );
  }

  if (
    req.body.reason !== undefined &&
    req.body.reason !== null &&
    (
      typeof req.body.reason !== "string" ||
      req.body.reason.length > 500
    )
  ) {
    return badRequest(
      res,
      "Reason must be a string of at most 500 characters."
    );
  }

  next();
}
