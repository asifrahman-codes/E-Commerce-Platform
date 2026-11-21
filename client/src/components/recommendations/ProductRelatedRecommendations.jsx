import { useEffect, useState } from "react";

import RecommendationCarousel from "./RecommendationCarousel";
import recommendationService from "../../services/recommendation.service";

const EMPTY_RESULT = {
  related: [],
  similar_by_brand: [],
  frequently_bought_together: [],
};

export default function ProductRelatedRecommendations({ productId }) {
  const [recommendations, setRecommendations] = useState(EMPTY_RESULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    recommendationService.getProductRecommendations(productId)
      .then((result) => {
        if (active) {
          setRecommendations({
            related: result?.related ?? [],
            similar_by_brand: result?.similar_by_brand ?? [],
            frequently_bought_together:
              result?.frequently_bought_together ?? [],
          });
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(
            loadError?.message ||
            "Unable to load related product recommendations."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [productId, retry]);

  if (error && !loading) {
    return (
      <div
        role="alert"
        className="container-custom mt-12 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        <span>{error}</span>
        <button
          type="button"
          onClick={() => setRetry((value) => value + 1)}
          className="ml-3 font-semibold underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <RecommendationCarousel
        title="Related products"
        description="More in this product's category."
        products={recommendations.related}
        loading={loading}
      />
      <RecommendationCarousel
        title="Similar brands"
        description="Other in-stock products from the same brand."
        products={recommendations.similar_by_brand}
        loading={loading}
      />
      <RecommendationCarousel
        title="Frequently bought together"
        description="Products that appeared in the same delivered orders."
        products={recommendations.frequently_bought_together}
        loading={loading}
      />
    </>
  );
}
