import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Package, ShoppingBag, Star } from "lucide-react";

import {
  formatPrice,
  getImageUrl,
  getResponsiveImageProps,
  getProductId,
  getProductName,
  getProductPrice,
  getProductRating,
  getProductReviewCount,
  getProductStock,
} from "../../utils/product.utils";
import WishlistButton from "../wishlist/WishlistButton";
import CompareButton from "./CompareButton";
import SafeImage from "../common/SafeImage";

function ProductCard({
  product,
  view = "grid",
  showRating = true,
}) {
  const isList = view === "list";
  const productId = getProductId(product);
  const name = getProductName(product);
  const price = getProductPrice(product);
  const stock = getProductStock(product);
  const rating = getProductRating(product);
  const reviewCount = getProductReviewCount(product);
  const originalPrice = Number(
    product?.original_price ??
      product?.compare_at_price ??
      product?.regular_price ??
      0
  );
  const hasDiscount = originalPrice > price && price > 0;
  const discountPercent = hasDiscount
    ? Math.max(1, Math.round(((originalPrice - price) / originalPrice) * 100))
    : 0;
  const image = getImageUrl(
    product?.primary_image ??
      product?.primary_image_url ??
      product?.image_url ??
      product?.image
  );
  const imageProps = getResponsiveImageProps(image, {
    sizes: "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw",
  });

  return (
    <article
      className={`premium-card-hover group overflow-hidden rounded-[1.35rem] border border-line bg-white ${
        isList ? "flex flex-col sm:flex-row" : ""
      }`}
    >
      <div className={`relative shrink-0 ${isList ? "sm:w-52" : ""}`}>
        <Link
          to={`/products/${productId}`}
          aria-label={`View ${name}`}
          className="block"
        >
          <div
            className={`relative flex items-center justify-center overflow-hidden bg-[#f2f4ef] ${
              isList ? "aspect-[4/3] sm:aspect-square" : "aspect-[4/5]"
            }`}
          >
          {image ? (
            <SafeImage
              {...imageProps}
              alt={name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-[1.04]"
              fallbackClassName="bg-[#f2f4ef]"
              fallbackSize={50}
            />
          ) : (
            <Package size={50} strokeWidth={1.2} className="text-[#b9c3ba]" />
          )}
          </div>
        </Link>
        <span
          className={`pointer-events-none absolute left-2 top-2 z-10 rounded-full px-2 py-1 text-[10px] font-semibold sm:left-3 sm:top-3 sm:px-3 sm:text-[11px] ${
            stock > 0
              ? "bg-white/90 text-emerald-800 shadow-sm backdrop-blur"
              : "bg-white/90 text-rose-700 shadow-sm backdrop-blur"
          }`}
        >
          {stock > 0 ? "In stock" : "Out of stock"}
        </span>
        {hasDiscount && (
          <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full bg-[#173727] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
            −{discountPercent}%
          </span>
        )}
        <div className="absolute right-3 top-3 z-20">
          <WishlistButton productId={productId} />
        </div>
      </div>

      <div className={`flex flex-1 flex-col p-4 sm:p-5 ${isList ? "sm:py-6" : ""}`}>
        {product?.brand_name && (
          <p className="mb-1.5 truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            {product.brand_name}
          </p>
        )}

        <Link to={`/products/${productId}`}>
          <h3 className="line-clamp-2 min-h-12 font-medium leading-6 text-ink transition group-hover:text-indigo-700">
            {name}
          </h3>
        </Link>

        {showRating && reviewCount > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-amber-600">
            <Star size={15} fill="currentColor" />
            <span className="font-semibold text-ink">{rating.toFixed(1)}</span>
            <span className="text-muted">({reviewCount})</span>
          </div>
        )}

        <CompareButton productId={productId} className="mt-3 w-fit" compact />

        <div className="mt-auto flex flex-col items-stretch gap-3 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-semibold text-ink">{formatPrice(price)}</p>
            {hasDiscount && (
              <p className="mt-0.5 text-xs text-muted line-through">
                {formatPrice(originalPrice)}
              </p>
            )}
          </div>

          <Link
            to={`/products/${productId}`}
            aria-label={`View ${name}${stock > 0 ? " and choose options" : ""}`}
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-indigo-600 px-3 text-xs font-semibold !text-white transition 
            hover:bg-indigo-700 sm:w-auto sm:px-4 sm:text-sm"
          >
            {isList ? <ArrowUpRight size={17} /> : <ShoppingBag size={16} />}
            <span>{stock > 0 ? "Choose options" : "View details"}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
