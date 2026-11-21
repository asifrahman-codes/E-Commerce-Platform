import { useCallback, useEffect, useState } from "react";

import useAuth from "../../hooks/useAuth";
import recommendationService from "../../services/recommendation.service";
import { getRecentlyViewedProducts } from "../../utils/recentlyViewed";
import RecommendationCarousel from "./RecommendationCarousel";

const EMPTY_RECOMMENDATIONS = {
  popular: [],
  best_selling: [],
  new_arrivals: [],
};

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export default function HomeRecommendations() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [globalRecommendations, setGlobalRecommendations] = useState(
    EMPTY_RECOMMENDATIONS
  );
  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");
  const [personalized, setPersonalized] = useState([]);
  const [personalizedLoading, setPersonalizedLoading] = useState(false);
  const [personalizedError, setPersonalizedError] = useState("");
  const [personalizedLoaded, setPersonalizedLoaded] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [recentlyViewedLoading, setRecentlyViewedLoading] = useState(false);
  const [recentlyViewedError, setRecentlyViewedError] = useState("");

  const loadGlobalRecommendations = useCallback(async () => {
    setGlobalLoading(true);
    setGlobalError("");
    try {
      const result = await recommendationService.getPublicRecommendations();
      setGlobalRecommendations({
        popular: result?.popular ?? [],
        best_selling: result?.best_selling ?? [],
        new_arrivals: result?.new_arrivals ?? [],
      });
    } catch (error) {
      setGlobalError(
        getErrorMessage(error, "Unable to load product recommendations.")
      );
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGlobalRecommendations();
  }, [loadGlobalRecommendations]);

  useEffect(() => {
    let active = true;

    if (authLoading) return () => { active = false; };
    if (!isAuthenticated) {
      setPersonalized([]);
      setPersonalizedError("");
      setPersonalizedLoaded(false);
      setPersonalizedLoading(false);
      return () => { active = false; };
    }

    setPersonalizedLoading(true);
    setPersonalizedError("");
    setPersonalizedLoaded(false);
    recommendationService.getPersonalizedRecommendations()
      .then((result) => {
        if (active) setPersonalized(result?.products ?? []);
      })
      .catch((error) => {
        if (active) {
          setPersonalized([]);
          setPersonalizedError(
            getErrorMessage(error, "Unable to load personalized products.")
          );
        }
      })
      .finally(() => {
        if (active) {
          setPersonalizedLoaded(true);
          setPersonalizedLoading(false);
        }
      });

    return () => { active = false; };
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    let active = true;
    const ids = [...new Set(
      getRecentlyViewedProducts()
        .map((product) => Number(product.product_id ?? product.id))
        .filter((id) => Number.isSafeInteger(id) && id > 0)
    )].slice(0, 8);

    if (!ids.length) return () => { active = false; };

    setRecentlyViewedLoading(true);
    setRecentlyViewedError("");
    recommendationService.getRecentlyViewedRecommendations(ids)
      .then((result) => {
        if (active) setRecentlyViewed(result?.products ?? []);
      })
      .catch((error) => {
        if (active) {
          setRecentlyViewedError(
            getErrorMessage(error, "Unable to load recently viewed products.")
          );
        }
      })
      .finally(() => {
        if (active) setRecentlyViewedLoading(false);
      });

    return () => { active = false; };
  }, []);

  const hasPersonalizedProducts = personalized.length > 0;
  const recommendedProducts = hasPersonalizedProducts
    ? personalized
    : globalRecommendations.popular;
  const recommendationTitle = hasPersonalizedProducts
    ? "Recommended for you"
    : "Popular picks";
  const recommendedDescription = hasPersonalizedProducts
    ? "Based on categories and brands from your completed orders."
    : personalizedError
      ? "Your purchase-based recommendations are unavailable; showing popular products instead."
      : personalizedLoaded
        ? "No purchase-based matches are available right now, so these popular products are a starting point."
        : "Popular with customers, based on delivered orders.";

  return (
    <>
      <RecommendationCarousel
        title={recommendationTitle}
        description={recommendedDescription}
        products={recommendedProducts}
        loading={globalLoading || authLoading || personalizedLoading}
        error={globalError && !hasPersonalizedProducts ? globalError : ""}
        onRetry={loadGlobalRecommendations}
      />
      {personalizedError && (
        <p role="status" className="container-custom -mt-7 pb-4 text-xs text-zinc-500">
          Purchase-based recommendations are unavailable: {personalizedError}
          {" "}Popular products are shown instead.
        </p>
      )}

      {hasPersonalizedProducts && (
        <RecommendationCarousel
          title="Popular with customers"
          description="Products most often purchased in delivered orders."
          products={globalRecommendations.popular}
          loading={globalLoading}
          error={globalError}
          onRetry={loadGlobalRecommendations}
        />
      )}

      <RecommendationCarousel
        title="Best sellers"
        description="Ranked by the quantity in delivered orders."
        products={globalRecommendations.best_selling}
        loading={globalLoading}
        error={globalError}
        onRetry={loadGlobalRecommendations}
      />

      <RecommendationCarousel
        title="New arrivals"
        description="Recently added products that currently have stock."
        products={globalRecommendations.new_arrivals}
        loading={globalLoading}
        error={globalError}
        onRetry={loadGlobalRecommendations}
      />

      <RecommendationCarousel
        title="Recently viewed"
        description="Products you viewed on this browser."
        products={recentlyViewed}
        loading={recentlyViewedLoading}
        error={recentlyViewedError}
      />
    </>
  );
}
