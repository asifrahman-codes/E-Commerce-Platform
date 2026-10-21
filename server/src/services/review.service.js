
import * as reviewRepository from "../repositories/review.repository.js";

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateReviewInput({ rating, title, comment }) {
  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    throw createError(
      400,
      "Rating must be an integer between 1 and 5."
    );
  }

  if (
    title !== undefined &&
    title !== null &&
    (
      typeof title !== "string" ||
      title.trim().length > 150
    )
  ) {
    throw createError(
      400,
      "Title must be a string of at most 150 characters."
    );
  }

  if (
    comment !== undefined &&
    comment !== null &&
    typeof comment !== "string"
  ) {
    throw createError(400, "Comment must be a string.");
  }

  if (typeof comment === "string" && comment.length > 5000) {
    throw createError(
      400,
      "Comment cannot exceed 5000 characters."
    );
  }

  if (
    (!title || !title.trim()) &&
    (!comment || !comment.trim())
  ) {
    throw createError(
      400,
      "Provide a review title or comment."
    );
  }
}

function parsePositiveId(value, fieldName) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw createError(400, `Invalid ${fieldName}.`);
  }

  return id;
}

function parsePagination(query = {}) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);

  if (!Number.isInteger(page) || page < 1) {
    throw createError(400, "Page must be a positive integer.");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw createError(400, "Limit must be between 1 and 50.");
  }

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export async function createReview(userId, input) {
  const customerId = parsePositiveId(userId, "user ID");
  const productId = parsePositiveId(input.productId, "product ID");

  const rating = Number(input.rating);

  const data = {
    rating,
    title: input.title?.trim() || null,
    comment: input.comment?.trim() || null,
  };

  validateReviewInput(data);

  const existingReview =
    await reviewRepository.findUserProductReview(
      customerId,
      productId
    );

  if (existingReview) {
    throw createError(
      409,
      "You have already reviewed this product."
    );
  }

  const purchase = await reviewRepository.findDeliveredPurchase(
    customerId,
    productId
  );

  if (!purchase) {
    throw createError(
      403,
      "You can review this product only after an order containing it has been delivered."
    );
  }

  try {
    return await reviewRepository.createReview({
      productId,
      userId: customerId,
      orderId: purchase.order_id,
      ...data,
    });
  } catch (error) {
    // The unique database constraint is the final protection
    // against two simultaneous review submissions.
    if (error.code === "ER_DUP_ENTRY") {
      throw createError(
        409,
        "You have already reviewed this product."
      );
    }

    throw error;
  }
}

export async function updateOwnReview(userId, reviewId, input) {
  const customerId = parsePositiveId(userId, "user ID");
  const id = parsePositiveId(reviewId, "review ID");

  const existing = await reviewRepository.findUserReview(
    customerId,
    id
  );

  if (!existing) {
    throw createError(404, "Review not found.");
  }

  const rating = Number(input.rating);

  const data = {
    rating,
    title: input.title?.trim() || null,
    comment: input.comment?.trim() || null,
  };

  validateReviewInput(data);

  return reviewRepository.updateReview(id, data);
}

export async function deleteOwnReview(userId, reviewId) {
  const customerId = parsePositiveId(userId, "user ID");
  const id = parsePositiveId(reviewId, "review ID");

  const existing = await reviewRepository.findUserReview(
    customerId,
    id
  );

  if (!existing) {
    throw createError(404, "Review not found.");
  }

  await reviewRepository.deleteReview(id);

  return { message: "Review deleted successfully." };
}

export async function getProductReviews(productId, query) {
  const id = parsePositiveId(productId, "product ID");
  const pagination = parsePagination(query);

  const [summary, reviews] = await Promise.all([
    reviewRepository.getProductRatingSummary(id),
    reviewRepository.getApprovedProductReviews(id, pagination),
  ]);

  return {
    product_id: id,
    summary,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
    },
    reviews,
  };
}

export async function getMyReviews(userId) {
  const customerId = parsePositiveId(userId, "user ID");

  return reviewRepository.getUserReviews(customerId);
}

export async function getReviewsForModeration(query) {
  const pagination = parsePagination(query);
  const allowedStatuses = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "HIDDEN",
  ];

  const status = query.status
    ? String(query.status).toUpperCase()
    : null;

  if (status && !allowedStatuses.includes(status)) {
    throw createError(400, "Invalid review status filter.");
  }

  const reviews = await reviewRepository.getAdminReviews({
    status,
    ...pagination,
  });

  return {
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
    },
    reviews,
  };
}

export async function moderateReview(
  adminId,
  reviewId,
  input
) {
  const id = parsePositiveId(reviewId, "review ID");
  const moderatorId = parsePositiveId(adminId, "admin ID");

  const status = String(input.status ?? "").toUpperCase();
  const allowedStatuses = ["APPROVED", "REJECTED", "HIDDEN"];

  if (!allowedStatuses.includes(status)) {
    throw createError(
      400,
      "Status must be APPROVED, REJECTED, or HIDDEN."
    );
  }

  const reason = input.reason?.trim() || null;

  if (reason && reason.length > 500) {
    throw createError(
      400,
      "Moderation reason cannot exceed 500 characters."
    );
  }

  const updated = await reviewRepository.moderateReview(id, {
    status,
    adminId: moderatorId,
    reason,
  });

  if (!updated) {
    throw createError(404, "Review not found.");
  }

  return updated;
}
