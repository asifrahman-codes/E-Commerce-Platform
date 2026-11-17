import { useCallback, useEffect, useState } from "react";

import {
  getAdminReviews,
  moderateReview,
} from "../../services/review.service";

import StarRating from "../../components/reviews/StarRating";

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminReviews({
        status,
        page,
        limit: 10,
      });

      setReviews(response?.reviews ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleModeration = async (reviewId, newStatus) => {
    const reason =
      newStatus === "REJECTED"
        ? window.prompt("Enter rejection reason (optional):") ?? null
        : "";

    if (reason === null) return;

    try {
      setError("");
      setMessage("");

      await moderateReview(reviewId, {
        status: newStatus,
        reason,
      });

      setMessage(`Review ${newStatus.toLowerCase()} successfully.`);

      await fetchReviews();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to moderate review."
      );
    }
  };

  return (
    <div className="container-custom py-10">
      <h1 className="text-3xl font-bold text-zinc-900">
        Review Management
      </h1>

      <p className="mt-2 text-sm text-zinc-500">
        Review customer feedback and manage publication status.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <label
          htmlFor="review-status"
          className="text-sm font-medium text-zinc-700"
        >
          Filter by status
        </label>

        <select
          id="review-status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
        >
          <option value="">All reviews</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {error && (
        <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-zinc-500">
          Loading reviews...
        </p>
      ) : reviews.length === 0 ? (
        <div className="mt-8 rounded-xl border border-zinc-200 p-10 text-center text-zinc-500">
          No reviews found for this status.
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {reviews.map((review) => (
            <article
              key={review.review_id}
              className="rounded-xl border border-zinc-200 p-5"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-zinc-900">
                    {review.product_name}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    By {review.reviewer_name || "Customer"}
                  </p>
                </div>

                <span className="h-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                  {review.status}
                </span>
              </div>

              <div className="mt-4">
                <StarRating rating={review.rating} />
              </div>

              {review.title && (
                <h3 className="mt-3 font-semibold text-zinc-800">
                  {review.title}
                </h3>
              )}

              {review.comment && (
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-600">
                  {review.comment}
                </p>
              )}

              {review.moderation_reason && (
                <p className="mt-3 text-sm text-red-600">
                  Previous moderation reason:{" "}
                  {review.moderation_reason}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                {review.status !== "APPROVED" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleModeration(
                        review.review_id,
                        "APPROVED"
                      )
                    }
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                )}

                {review.status !== "REJECTED" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleModeration(
                        review.review_id,
                        "REJECTED"
                      )
                    }
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Reject
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-7 flex justify-between">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => setPage((value) => value - 1)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm disabled:opacity-40"
        >
          Previous
        </button>

        <span className="self-center text-sm text-zinc-500">
          Page {page}
        </span>

        <button
          type="button"
          disabled={reviews.length < 10 || loading}
          onClick={() => setPage((value) => value + 1)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}