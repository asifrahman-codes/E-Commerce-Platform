import api from "./api";
import ENDPOINTS from "./endpoints";
import { getCachedRequest, serializeRequestParams } from "./request-cache";

function unwrap(response) {
  const body = response?.data ?? response;
  return body?.data ?? body;
}

const recommendationService = {
  async getPublicRecommendations(params = {}) {
    const key = `recommendations:public:${serializeRequestParams(params)}`;
    return getCachedRequest(key, async () => (
      unwrap(await api.get(ENDPOINTS.RECOMMENDATIONS.BASE, { params }))
    ), 15_000);
  },

  async getPersonalizedRecommendations(params = {}) {
    const result = unwrap(await api.get(
      ENDPOINTS.RECOMMENDATIONS.PERSONALIZED,
      { params }
    ));
    return {
      ...result,
      products: result?.recommendations ?? result?.products ?? [],
    };
  },

  async getProductRecommendations(productId, params = {}) {
    const key = `recommendations:product:${productId}:${serializeRequestParams(params)}`;
    return getCachedRequest(key, async () => (
      unwrap(await api.get(
        ENDPOINTS.RECOMMENDATIONS.FOR_PRODUCT(productId),
        { params }
      ))
    ), 15_000);
  },

  async getRecentlyViewedRecommendations(productIds) {
    const ids = productIds.join(",");
    return getCachedRequest(`recommendations:recent:${ids}`, async () => (
      unwrap(await api.get(ENDPOINTS.RECOMMENDATIONS.RECENTLY_VIEWED, {
        params: { ids },
      }))
    ), 15_000);
  },
};

export default recommendationService;
