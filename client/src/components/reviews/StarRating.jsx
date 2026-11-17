import { Star } from "lucide-react";

export default function StarRating({
  rating = 0,
  onChange,
  size = 18,
  interactive = false,
}) {
  const value = Math.min(5, Math.max(0, Number(rating) || 0));

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange?.(star)}
              aria-label={`Rate ${star} out of 5`}
              className="rounded-sm transition hover:scale-110"
            >
              <Star
                size={size}
                className={
                  active
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-300"
                }
              />
            </button>
          );
        }

        return (
          <Star
            key={star}
            size={size}
            className={
              active
                ? "fill-amber-400 text-amber-400"
                : "text-zinc-300"
            }
          />
        );
      })}
    </div>
  );
}