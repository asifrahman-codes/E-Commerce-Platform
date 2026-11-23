import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Package,
  ShoppingBag,
} from "lucide-react";

import {
  formatPrice,
  getImageUrl,
  getProductId,
  getProductName,
  getProductPrice,
  getProductStock,
} from "../../utils/product.utils";
import SafeImage from "../common/SafeImage";

export default function AIProductCard({ product }) {
  const id = getProductId(product);
  const name = getProductName(product);
  const image = getImageUrl(
    product?.primary_image ??
    product?.primary_image_url ??
    product?.image_url ??
    product?.image
  );

  const price = getProductPrice(product);
  const stock = getProductStock(product);

  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <Link
        to={`/products/${id}`}
        className="block"
      >
        <div className="flex h-32 items-center justify-center bg-gray-50 p-3">
          {image ? (
            <SafeImage
              src={image}
              alt={name}
              loading="lazy"
              className="h-full w-full object-contain"
              fallbackSize={36}
            />
          ) : (
            <Package
              size={36}
              className="text-gray-400"
            />
          )}
        </div>
      </Link>

      <div className="space-y-2 p-3">
        <p className="line-clamp-2 min-h-10 text-sm font-semibold text-gray-900">
          {name}
        </p>

        <p className="font-bold text-indigo-700">
          {formatPrice(price)}
        </p>

        <p className={`text-xs ${
          stock > 0
            ? "text-emerald-600"
            : "text-rose-600"
        }`}>
          {stock > 0 ? "In stock" : "Out of stock"}
        </p>

        <Link
          to={`/products/${id}`}
          className="flex min-h-9 items-center justify-center gap-2 rounded-lg bg-indigo-700 px-3 text-xs font-semibold text-white transition hover:bg-indigo-800"
        >
          <ShoppingBag size={14} />
          View product
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </article>
  );
}