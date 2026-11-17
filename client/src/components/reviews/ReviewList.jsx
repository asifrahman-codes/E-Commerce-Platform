import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createReview,
  getProductReviews,
} from "../../services/review.service";

import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

import RatingSummary from "./RatingSummary";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";

export default function ReviewList({ productId }) {
  const navigate = useNavigate();

  const { isAuthenticated } = useContext(AuthContext);

  const [result, setResult] = useState(null);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProductReviews(productId, {
        page,
        limit: 10,
      });

      setResult(response);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load product reviews."
      );
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleCreateReview = async (formData) => {
    if (!isAuthenticated) {
      navigate(
        `/login?redirect=${encodeURIComponent(
          `/products/${productId}`
        )}`
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      await createReview({
        product_id: Number(productId),
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
      });

      setMessage(
        "Your review has been submitted and is awaiting moderation."
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to submit your review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const summary = result?.summary ?? {};
  const reviews = result?.reviews ?? [];
  const pagination = result?.pagination ?? {};

  const currentPage = Number(pagination.page ?? page);
  const limit = Number(pagination.limit ?? 10);
  const totalReviews = Number(summary.total_reviews ?? 0);

  const hasNextPage =
    reviews.length === limit &&
    currentPage * limit < totalReviews;

  return (
    <section className="mt-16 border-t border-zinc-200 pt-10">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">
            Customer Reviews
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Ratings and feedback from customers.
          </p>
        </div>

        <Link
          to="/my-reviews"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          My Reviews
        </Link>
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {!loading && (
        <RatingSummary summary={summary} />
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-zinc-900">
            Customer feedback
          </h3>

          {loading ? (
            <p className="py-8 text-sm text-zinc-500">
              Loading reviews...
            </p>
          ) : reviews.length === 0 ? (
            <div className="rounded-xl bg-zinc-50 p-8 text-center">
              <p className="font-medium text-zinc-800">
                No approved reviews yet.
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Be the first customer to share your experience.
              </p>
            </div>
          ) : (
            <>
              {reviews.map((review) => (
                <ReviewCard
                  key={review.review_id}
                  review={review}
                />
              ))}

              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setPage((value) => value - 1)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm text-zinc-500">
                  Page {currentPage}
                </span>

                <button
                  type="button"
                  disabled={!hasNextPage || loading}
                  onClick={() => setPage((value) => value + 1)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        <div>
          <ReviewForm
            onSubmit={handleCreateReview}
            submitting={submitting}
          />
        </div>
      </div>
    </section>
  );
}