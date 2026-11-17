import { useEffect, useState } from "react";
import StarRating from "./StarRating";

export default function ReviewForm({
  initialReview = null,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [rating, setRating] = useState(
    Number(initialReview?.rating ?? 5)
  );

  const [title, setTitle] = useState(
    initialReview?.title ?? ""
  );

  const [comment, setComment] = useState(
    initialReview?.comment ?? ""
  );

  const [error, setError] = useState("");

  useEffect(() => {
    setRating(Number(initialReview?.rating ?? 5));
    setTitle(initialReview?.title ?? "");
    setComment(initialReview?.comment ?? "");
    setError("");
  }, [initialReview]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim() && !comment.trim()) {
      setError("Please provide a review title or comment.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a rating.");
      return;
    }

    setError("");

    await onSubmit({
      rating,
      title: title.trim(),
      comment: comment.trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-200 bg-white p-5"
    >
      <h3 className="text-lg font-semibold text-zinc-900">
        {initialReview ? "Edit your review" : "Write a review"}
      </h3>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          Your rating
        </label>

        <StarRating
          rating={rating}
          interactive
          onChange={setRating}
          size={28}
        />
      </div>

      <div className="mt-5">
        <label
          htmlFor="review-title"
          className="mb-2 block text-sm font-medium text-zinc-700"
        >
          Review title
        </label>

        <input
          id="review-title"
          type="text"
          maxLength={150}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Summarize your experience"
          className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="review-comment"
          className="mb-2 block text-sm font-medium text-zinc-700"
        >
          Your review
        </label>

        <textarea
          id="review-comment"
          rows={5}
          maxLength={5000}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Tell others about your experience..."
          className="w-full resize-y rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        <p className="mt-1 text-right text-xs text-zinc-400">
          {comment.length}/5000
        </p>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting
            ? "Submitting..."
            : initialReview
              ? "Update review"
              : "Submit review"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
        )}
      </div>

      <p className="mt-4 text-xs leading-5 text-zinc-500">
        Your review will be submitted for moderation before it
        appears publicly.
      </p>
    </form>
  );
}