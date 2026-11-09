import { Link } from "react-router-dom";
import {
  Star,
  ShoppingBag,
  Package,
} from "lucide-react";

import {
  getProductId,
  getProductName,
  getProductPrice,
  getProductStock,
  getProductRating,
  getProductReviewCount,
  getImageUrl,
  formatPrice,
} from "../../utils/product.utils";

export default function ProductCard({ product }) {
  const productId = getProductId(product);
  const name = getProductName(product);
  const price = getProductPrice(product);
  const stock = getProductStock(product);
  const rating = getProductRating(product);
  const reviewCount = getProductReviewCount(product);

  const image = getImageUrl(
    product?.primary_image ??
    product?.image_url ??
    product?.image
  );

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <Link
        to={`/products/${productId}`}
        className="block"
      >
        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-zinc-50">
          {image ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-105"
            />
          ) : (
            <Package
              size={58}
              className="text-zinc-300"
            />
          )}

          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
              stock > 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </Link>

      <div className="p-4">
        <p className="mb-1 text-xs font-medium text-indigo-600">
          {product?.brand_name ?? "ShopSphere"}
        </p>

        <Link to={`/products/${productId}`}>
          <h3 className="line-clamp-2 min-h-12 font-semibold text-zinc-900 transition hover:text-indigo-600">
            {name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-amber-500">
          <Star size={15} fill="currentColor" />

          <span className="font-semibold text-zinc-700">
            {rating.toFixed(1)}
          </span>

          <span className="text-zinc-400">
            ({reviewCount})
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="font-bold text-zinc-900">
            {formatPrice(price)}
          </p>

          <Link
            to={`/products/${productId}`}
            aria-label={`View ${name}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700"
          >
            <ShoppingBag size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}