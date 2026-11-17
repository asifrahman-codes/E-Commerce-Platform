import StarRating from "./StarRating";

export default function RatingSummary({ summary }) {
  const average = Number(summary?.average_rating ?? 0);
  const total = Number(summary?.total_reviews ?? 0);
  const distribution = summary?.distribution ?? {};

  return (
    <div className="grid gap-8 rounded-2xl border border-zinc-200 p-6 sm:grid-cols-2">
      <div>
        <p className="text-sm font-medium text-zinc-500">
          Average customer rating
        </p>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-5xl font-bold text-zinc-900">
            {average.toFixed(1)}
          </span>

          <div>
            <StarRating rating={average} size={20} />
            <p className="mt-1 text-sm text-zinc-500">
              {total} {total === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = Number(distribution[star] ?? 0);
          const percentage =
            total > 0 ? (count / total) * 100 : 0;

          return (
            <div
              key={star}
              className="flex items-center gap-3 text-sm"
            >
              <span className="w-10 text-zinc-600">
                {star} star
              </span>

              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <span className="w-8 text-right text-zinc-500">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}