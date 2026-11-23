import * as recommendationService from "../services/recommendation.service.js";

export async function getPublicRecommendations(req, res, next) {
  try {
    const data = await recommendationService.getPublicRecommendations(
      req.query
    );

    return res.status(200).json({
      success: true,
      message: "Product recommendations retrieved successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPersonalizedRecommendations(req, res, next) {
  try {
    const personalizedParams = { limit: req.query.limit };
    if (req.query.recent_ids) {
      personalizedParams.recent_ids = req.query.recent_ids;
    }
    const data = await recommendationService.getPersonalizedRecommendations(
      req.user.user_id,
      personalizedParams
    );

    return res.status(200).json({
      success: true,
      message: "Personalized recommendations retrieved successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductRecommendations(req, res, next) {
  try {
    const data = await recommendationService.getProductRecommendations(
      req.params.productId,
      req.query
    );

    return res.status(200).json({
      success: true,
      message: "Related product recommendations retrieved successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecentlyViewedRecommendations(req, res, next) {
  try {
    const data = await recommendationService.getRecentlyViewedRecommendations(
      req.query.ids
    );

    return res.status(200).json({
      success: true,
      message: "Recently viewed products retrieved successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
}
