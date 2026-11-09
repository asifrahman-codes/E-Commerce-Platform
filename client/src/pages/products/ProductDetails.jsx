import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronRight,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";

import productService from "../../services/product.service";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

import {
  getImageUrl,
  formatPrice,
} from "../../utils/product.utils";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const [productData, imageData] = await Promise.all([
          productService.getProductById(id),
          productService.getProductImages(id).catch(() => []),
        ]);

        if (!active) return;

        if (!productData || productData.success === false) {
          throw new Error("Product not found.");
        }

        setProduct(productData);

        const productImages = imageData
          .map(getImageUrl)
          .filter(Boolean);

        const uniqueImages = [...new Set(productImages)];

        setImages(uniqueImages);
        setSelectedImage(uniqueImages[0] ?? "");
      } catch (err) {
        if (!active) return;

        setError(
          err?.response?.data?.message ||
          err.message ||
          "Unable to load product details."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom py-16">
        <ErrorMessage message={error || "Product not found."} />

        <Link
          to="/products"
          className="mt-5 inline-block font-semibold text-indigo-600"
        >
          Back to products
        </Link>
      </div>
    );
  }

  const name = product.name ?? "Untitled Product";

  const basePrice = Number(product.base_price ?? 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-8">

        {/* Breadcrumb */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <Link to="/" className="hover:text-indigo-600">
            Home
          </Link>

          <ChevronRight size={15} />

          <Link to="/products" className="hover:text-indigo-600">
            Products
          </Link>

          <ChevronRight size={15} />

          <span className="text-zinc-900">{name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">

          {/* Image gallery */}
          <div>
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-zinc-50">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={name}
                  className="h-full w-full object-contain p-6"
                />
              ) : (
                <Package
                  size={80}
                  className="text-zinc-300"
                />
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`aspect-square overflow-hidden rounded-xl border-2 bg-zinc-50 ${
                      selectedImage === image
                        ? "border-indigo-600"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${name} image ${index + 1}`}
                      className="h-full w-full object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product information */}
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-indigo-600">
              {product.category_name ?? "Products"}
            </p>

            <h1 className="text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
              {name}
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              Brand: {product.brand_name ?? "Not specified"}
            </p>

            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Base price
              </p>

              <p className="mt-1 text-3xl font-bold text-zinc-900">
                {formatPrice(basePrice)}
              </p>
            </div>

            <div className="mt-7 border-t border-zinc-100 pt-6">
              <h2 className="mb-3 font-semibold text-zinc-900">
                Description
              </h2>

              <p className="whitespace-pre-line leading-7 text-zinc-600">
                {product.description ||
                  "No product description is available."}
              </p>
            </div>

            <div className="mt-7 rounded-xl bg-zinc-50 p-4">
              <p className="text-sm leading-6 text-zinc-600">
                The displayed amount is the product's base price.
                Available variant prices and stock will be shown
                once the variant API is connected.
              </p>
            </div>

            {/* Cart functionality will be connected in Phase 6.5 */}
            <button
              type="button"
              disabled
              className="mt-8 w-full cursor-not-allowed rounded-xl bg-zinc-300 py-4 font-semibold text-zinc-600"
            >
              Add to Cart — Coming in Phase 6.5
            </button>

            <div className="mt-8 space-y-4 border-t border-zinc-100 pt-6">
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <Truck size={19} className="text-indigo-600" />
                Shipping information available during checkout
              </div>

              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <ShieldCheck size={19} className="text-indigo-600" />
                Secure checkout
              </div>

              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <Package size={19} className="text-indigo-600" />
                Product information from ShopSphere
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}