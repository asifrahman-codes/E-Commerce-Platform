import api from "./api";
import API_ENDPOINTS from "./endpoints";

const payload = (response) => response?.data ?? response;

export const getProductReviews = async (
  productId,
  { page = 1, limit = 10 } = {}
) => {
  return payload(
    await api.get(API_ENDPOINTS.REVIEWS.PRODUCT(productId), {
      params: { page, limit },
    })
  );
};

export const createReview = async (data) => {
  return payload(
    await api.post(API_ENDPOINTS.REVIEWS.BASE, data)
  );
};

export const getMyReviews = async () => {
  return payload(
    await api.get(API_ENDPOINTS.REVIEWS.MY_REVIEWS)
  );
};

export const updateReview = async (reviewId, data) => {
  return payload(
    await api.patch(
      API_ENDPOINTS.REVIEWS.DETAILS(reviewId),
      data
    )
  );
};

export const deleteReview = async (reviewId) => {
  return payload(
    await api.delete(
      API_ENDPOINTS.REVIEWS.DETAILS(reviewId)
    )
  );
};

export const getAdminReviews = async ({
  status = "",
  page = 1,
  limit = 10,
} = {}) => {
  return payload(
    await api.get(API_ENDPOINTS.REVIEWS.ADMIN, {
      params: {
        ...(status ? { status } : {}),
        page,
        limit,
      },
    })
  );
};

export const moderateReview = async (
  reviewId,
  { status, reason = "" }
) => {
  return payload(
    await api.patch(
      API_ENDPOINTS.REVIEWS.MODERATE(reviewId),
      { status, reason }
    )
  );
};