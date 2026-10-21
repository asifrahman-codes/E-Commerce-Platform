
import * as reviewService from "../services/review.service.js";

function sendSuccess(res, data, message = "Success") {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
}

export async function createReview(req, res, next) {
  try {
    const data = await reviewService.createReview(
      req.user.user_id,
      {
        productId: req.body.product_id,
        rating: req.body.rating,
        title: req.body.title,
        comment: req.body.comment,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Review submitted for moderation.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductReviews(req, res, next) {
  try {
    const data = await reviewService.getProductReviews(
      req.params.productId,
      req.query
    );

    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getMyReviews(req, res, next) {
  try {
    const data = await reviewService.getMyReviews(
      req.user.user_id
    );

    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function updateReview(req, res, next) {
  try {
    const data = await reviewService.updateOwnReview(
      req.user.user_id,
      req.params.reviewId,
      {
        rating: req.body.rating,
        title: req.body.title,
        comment: req.body.comment,
      }
    );

    return sendSuccess(
      res,
      data,
      "Review updated and returned to moderation."
    );
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const data = await reviewService.deleteOwnReview(
      req.user.user_id,
      req.params.reviewId
    );

    return sendSuccess(res, data, data.message);
  } catch (error) {
    next(error);
  }
}

export async function getReviewsForModeration(
  req,
  res,
  next
) {
  try {
    const data =
      await reviewService.getReviewsForModeration(req.query);

    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function moderateReview(req, res, next) {
  try {
    const data = await reviewService.moderateReview(
      req.user.user_id,
      req.params.reviewId,
      {
        status: req.body.status,
        reason: req.body.reason,
      }
    );

    return sendSuccess(res, data, "Review moderated successfully.");
  } catch (error) {
    next(error);
  }
}
