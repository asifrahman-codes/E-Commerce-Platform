import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMyReviews,
  updateReview,
  deleteReview,
} from "../../services/review.service";

import ReviewForm from "../../components/reviews/ReviewForm";
import StarRating from "../../components/reviews/StarRating";
import StorefrontSkeleton from "../../components/common/StorefrontSkeleton";

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyReviews();

      setReviews(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load your reviews."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleUpdate = async (formData) => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      await updateReview(editingReview.review_id, formData);

      setEditingReview(null);
      setMessage(
        "Review updated successfully. It is awaiting moderation again."
      );

      await fetchReviews();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to update review."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteReview(reviewId);

      setMessage("Review deleted successfully.");

      if (editingReview?.review_id === reviewId) {
        setEditingReview(null);
      }

      await fetchReviews();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to delete review."
      );
    }
  };

  return (
    <div className="shop-page">
    <div className="container-custom py-10 sm:py-14">
      <div className="mb-8">
        <Link
          to="/products"
          className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
        >
          ← Continue shopping
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
          My Reviews
        </h1>

        <p className="mt-2 text-sm text-muted">
          Manage the reviews you have submitted.
        </p>
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

      {editingReview && (
        <div className="mb-8">
          <ReviewForm
            initialReview={editingReview}
            onSubmit={handleUpdate}
            onCancel={() => setEditingReview(null)}
            submitting={saving}
          />
        </div>
      )}

      {loading ? (
        <StorefrontSkeleton label="Loading your reviews" layout="list" embedded />
      ) : reviews.length === 0 ? (
        <div className="shop-panel p-10 text-center">
          <h2 className="font-semibold text-zinc-800">
            You haven't submitted any reviews.
          </h2>

          <Link
            to="/products"
            className="mt-4 inline-block font-semibold text-indigo-600"
          >
            Explore products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.review_id}
              className="shop-panel p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link
                    to={`/products/${review.product_id}`}
                    className="font-semibold text-zinc-900 hover:text-indigo-600"
                  >
                    {review.product_name}
                  </Link>

                  <div className="mt-2">
                    <StarRating rating={review.rating} />
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    review.status === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : review.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {review.status}
                </span>
              </div>

              {review.title && (
                <h3 className="mt-4 font-semibold text-zinc-800">
                  {review.title}
                </h3>
              )}

              {review.comment && (
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-600">
                  {review.comment}
                </p>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingReview(review)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(review.review_id)}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}