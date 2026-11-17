import StarRating from "./StarRating";

export default function ReviewCard({ review }) {
  const reviewerName =
    review.reviewer_name || "Customer";

  const date = review.created_at
    ? new Date(review.created_at).toLocaleDateString()
    : "";

  return (
    <article className="border-b border-zinc-100 py-6 last:border-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-zinc-900">
            {reviewerName}
          </h3>

          <p className="mt-1 text-xs text-zinc-500">
            {date}
          </p>
        </div>

        <StarRating rating={review.rating} />
      </div>

      {review.title && (
        <h4 className="mt-4 font-semibold text-zinc-800">
          {review.title}
        </h4>
      )}

      {review.comment && (
        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-zinc-600">
          {review.comment}
        </p>
      )}
    </article>
  );
}