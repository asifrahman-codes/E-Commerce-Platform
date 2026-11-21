import { useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useWishlist } from "../../context/WishlistContext";

export default function WishlistButton({
  productId,
  className = "",
}) {
  const navigate = useNavigate();

  const {
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
  } = useWishlist();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const active = isInWishlist(productId);

  const handleClick = async () => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login?redirect=/wishlist");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (active) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to update your wishlist."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-pressed={active}
        aria-label={
          active ? "Remove from wishlist" : "Add to wishlist"
        }
        title={
          active ? "Remove from wishlist" : "Add to wishlist"
        }
        className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:border-red-200 hover:text-red-600 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 ${className}`}
      >
        <Heart
          size={19}
          className={
            active ? "fill-red-500 text-red-500" : ""
          }
        />
      </button>

      {error && (
        <span className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg bg-red-600 p-2 text-xs text-white shadow-lg">
          {error}
        </span>
      )}
    </div>
  );
}