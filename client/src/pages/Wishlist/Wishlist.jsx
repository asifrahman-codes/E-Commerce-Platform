import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

import { useWishlist } from "../../context/WishlistContext";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

import { getImageUrl, formatPrice } from "../../utils/format";

export default function Wishlist() {
  const {
    wishlist,
    loading,
    error,
    refreshWishlist,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();

  const [actionError, setActionError] = useState("");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    refreshWishlist().catch(() => {});
  }, [refreshWishlist]);

  const handleClearWishlist = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear your wishlist?"
    );

    if (!confirmed) return;

    try {
      setClearing(true);
      setActionError("");

      await clearWishlist();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Unable to clear your wishlist."
      );
    } finally {
      setClearing(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      setActionError("");
      await removeFromWishlist(productId);
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Unable to remove this product."
      );
    }
  };

  if (!localStorage.getItem("accessToken")) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <Heart size={48} className="mx-auto text-zinc-400" />

        <h1 className="mt-5 text-2xl font-bold text-zinc-900 dark:text-white">
          Sign in to view your wishlist
        </h1>

        <p className="mt-2 text-zinc-500">
          Sign in to save and manage your favorite products.
        </p>

        <Link
          to="/login?redirect=/wishlist"
          className="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading && wishlist.items.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && wishlist.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <ErrorMessage message={error} />

        <button
          onClick={() => refreshWishlist().catch(() => {})}
          className="mt-4 rounded-lg bg-indigo-600 px-5 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            My Wishlist
          </h1>

          <p className="mt-2 text-zinc-500">
            {wishlist.total_items} saved product(s)
          </p>
        </div>

        {wishlist.items.length > 0 && (
          <button
            type="button"
            onClick={handleClearWishlist}
            disabled={clearing}
            className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {clearing ? "Clearing..." : "Clear Wishlist"}
          </button>
        )}
      </div>

      {actionError && (
        <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {actionError}
        </div>
      )}

      {wishlist.items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 px-6 py-16 text-center dark:border-zinc-800">
          <Heart
            size={52}
            className="mx-auto text-zinc-400"
          />

          <h2 className="mt-5 text-xl font-bold text-zinc-900 dark:text-white">
            Your wishlist is empty
          </h2>

          <p className="mt-2 text-zinc-500">
            Save products you like and find them here later.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            <ShoppingBag size={18} />
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlist.items.map((item) => (
            <article
              key={item.wishlist_id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <Link
                to={`/products/${item.product_id}`}
                className="block aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800"
              >
                <img
                  src={getImageUrl(item.primary_image_url)}
                  alt={item.product_name}
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                />
              </Link>

              <div className="p-4">
                <Link
                  to={`/products/${item.product_id}`}
                  className="font-semibold text-zinc-900 hover:text-indigo-600 dark:text-white"
                >
                  {item.product_name}
                </Link>

                <p className="mt-2 font-bold text-zinc-900 dark:text-white">
                  {formatPrice(item.base_price)}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    to={`/products/${item.product_id}`}
                    className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    View Product
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.product_id)}
                    className="rounded-lg border border-zinc-200 p-2 text-red-600 hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-red-950/30"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}