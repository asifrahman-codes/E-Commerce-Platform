import { Link } from "react-router-dom";

import {
  ShoppingCart,
  Heart,
  Star,
} from "lucide-react";

const getProductId = (product) => {
  return (
    product.product_id ??
    product.id ??
    product.productId
  );
};

const getProductName = (product) => {
  return (
    product.name ??
    product.product_name ??
    product.title ??
    "Product"
  );
};

const getProductImage = (product) => {
  const images = product.images;

  if (Array.isArray(images) && images.length > 0) {
    const firstImage = images[0];

    return typeof firstImage === "string"
      ? firstImage
      : firstImage?.image_url || firstImage?.url;
  }

  return (
    product.image_url ??
    product.image ??
    product.thumbnail ??
    ""
  );
};

const getProductPrice = (product) => {
  return (
    product.min_price ??
    product.sale_price ??
    product.price ??
    product.base_price ??
    null
  );
};

const ProductCard = ({ product }) => {
  const id = getProductId(product);

  const name = getProductName(product);

  const image = getProductImage(product);

  const price = getProductPrice(product);

  const rating = Number(product.rating ?? product.average_rating ?? 0);

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">

        <Link to={id ? `/products/${id}` : "/products"}>

          {image ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              No Image Available
            </div>
          )}

        </Link>

        {/* Wishlist */}
        <button
          type="button"
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition hover:text-red-500"
        >
          <Heart size={18} />
        </button>

        {product.is_new && (
          <span className="absolute left-3 top-3 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white">
            New
          </span>
        )}

      </div>

      {/* Product Information */}
      <div className="p-4">

        <Link
          to={id ? `/products/${id}` : "/products"}
          className="line-clamp-2 min-h-12 text-sm font-semibold text-gray-900 transition hover:text-indigo-600"
        >
          {name}
        </Link>

        <div className="mt-2 flex items-center gap-1">

          <Star
            size={15}
            className="fill-amber-400 text-amber-400"
          />

          <span className="text-xs font-medium text-gray-700">
            {rating > 0 ? rating.toFixed(1) : "New"}
          </span>

        </div>

        <div className="mt-4 flex items-center justify-between gap-2">

          <span className="text-lg font-bold text-gray-900">
            {price !== null
              ? `Rs. ${Number(price).toLocaleString("en-PK")}`
              : "View Price"}
          </span>

          <Link
            to={id ? `/products/${id}` : "/products"}
            aria-label={`View ${name}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
          >
            <ShoppingCart size={19} />
          </Link>

        </div>

      </div>

    </article>
  );
};

export default ProductCard;