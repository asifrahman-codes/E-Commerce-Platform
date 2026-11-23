import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Package, Share2, ShoppingBag, Trash2 } from "lucide-react";

import { useWishlist } from "../../context/WishlistContext";

import ErrorMessage from "../../components/common/ErrorMessage";
import StorefrontSkeleton from "../../components/common/StorefrontSkeleton";

import {
  getImageUrl,
  formatPrice,
  getResponsiveImageProps,
} from "../../utils/product.utils";
import { shareWishlist } from "../../services/platform.service";

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
  const [sharing, setSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const handleShare = async () => {
    setSharing(true);
    setShareMessage("");
    try {
      const result = await shareWishlist("My ShopSphere wishlist");
      const data = result?.data ?? result;
      const url = `${window.location.origin}${data.share_url}`;
      await navigator.clipboard?.writeText(url);
      setShareMessage("Share link copied to clipboard.");
    } catch (shareError) {
      setShareMessage(shareError.message || "Unable to create a wishlist share link.");
    } finally {
      setSharing(false);
    }
  };

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
        err.message ||
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
        err.message ||
          "Unable to remove this product."
      );
    }
  };

  if (!localStorage.getItem("accessToken")) {
    return (
      <div className="premium-page mx-auto max-w-7xl px-4 py-20 text-center">
        <Heart size={48} className="mx-auto text-zinc-400" />

        <h1 className="mt-5 text-2xl font-bold text-zinc-900 dark:text-white">
          Sign in to view your wishlist
        </h1>

        <p className="mt-2 text-zinc-500">
          Sign in to save and manage your favorite products.
        </p>

        <Link
          to="/login?redirect=/wishlist"
          className="shop-button shop-button-primary mt-6"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading && wishlist.items.length === 0) {
    return <StorefrontSkeleton label="Loading your wishlist" />;
  }

  if (error && wishlist.items.length === 0) {
    return (
      <div className="container-custom py-12">
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
    <div className="premium-page">
    <div className="container-custom py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            My Wishlist
          </h1>

          <p className="mt-2 text-muted">
            {wishlist.total_items} saved {wishlist.total_items === 1 ? "product" : "products"}
          </p>
        </div>

        {wishlist.items.length > 0 && (
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleShare} disabled={sharing} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50">
              <Share2 size={16} /> {sharing ? "Creating…" : "Share"}
            </button>
            <button
              type="button"
              onClick={handleClearWishlist}
              disabled={clearing}
              className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              <Trash2 size={16} />
              {clearing ? "Clearing..." : "Clear Wishlist"}
            </button>
          </div>
        )}
      </div>
      {shareMessage && <p role="status" className="mb-5 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700">{shareMessage}</p>}

      {actionError && (
        <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {actionError}
        </div>
      )}

      {wishlist.items.length === 0 ? (
        <div className="shop-panel px-6 py-16 text-center">
          <Heart
            size={52}
            className="mx-auto text-zinc-400"
          />

          <h2 className="mt-5 text-xl font-semibold text-ink">
            Your wishlist is empty
          </h2>

          <p className="mt-2 text-zinc-500">
            Save products you like and find them here later.
          </p>

          <Link
            to="/products"
            className="shop-button shop-button-primary mt-6"
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
              className="overflow-hidden rounded-[1.35rem] border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <Link
                to={`/products/${item.product_id}`}
                aria-label={`View ${item.product_name}`}
                className="flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#f2f4ef]"
              >
                {getImageUrl(item.primary_image_url) ? (
                  <img
                    {...getResponsiveImageProps(item.primary_image_url, {
                      sizes: "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
                    })}
                    alt={item.product_name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain p-5 transition duration-500 hover:scale-[1.04]"
                  />
                ) : (
                  <Package size={44} strokeWidth={1.2} className="text-[#b9c3ba]" />
                )}
              </Link>

              <div className="p-4">
                <Link
                  to={`/products/${item.product_id}`}
                  className="font-medium text-ink hover:text-indigo-700"
                >
                  {item.product_name}
                </Link>

                <p className="mt-2 font-semibold text-ink">
                  {formatPrice(item.base_price)}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    to={`/products/${item.product_id}`}
                    className="shop-button shop-button-primary min-h-10 flex-1 rounded-lg px-3 py-2 text-center"
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
    </div>
    </div>
  );
}