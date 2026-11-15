import { useEffect, useContext, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ChevronRight,
  Package,
  ShieldCheck,
  Truck,
  AlertCircle,
} from "lucide-react";

import productService from "../../services/product.service";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

import {
  getImageUrl,
  formatPrice,
} from "../../utils/product.utils";

import { AuthContext } from "../../context/AuthContext";

import VariantManagement from "../../components/products/admin/VariantManagement";

import VariantSelector from "../../components/products/VariantSelector";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");

  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [variantError, setVariantError] = useState("");

  const { user, isAuthenticated, loading: authLoading } =
    useContext(AuthContext);

    const userRole = String(
    user?.role ?? user?.user_role ?? ""
  ).toUpperCase();

  const isAdmin =
      isAuthenticated && userRole === "ADMIN";

  /*
  |--------------------------------------------------------------------------
  | Load Product, Images and Variants
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      setLoading(true);
      setError("");
      setVariantError("");

      setProduct(null);
      setImages([]);
      setSelectedImage("");
      setVariants([]);
      setSelectedVariant(null);

      try {
        const [
          productData,
          imageData,
          variantData,
        ] = await Promise.all([
          productService.getProductById(id),

          productService.getProductImages(id).catch(() => []),

          productService.getProductVariants(id).catch((err) => {
            if (active) {
              setVariantError(
                err?.response?.data?.message ||
                "Unable to load product variants."
              );
            }

            return [];
          }),
        ]);

        if (!active) return;

        if (!productData || productData.success === false) {
          throw new Error("Product not found.");
        }

        setProduct(productData);

        /*
         * Images API returns image records.
         * Repository orders primary image first.
         */

        const imageUrls = imageData
          .map(getImageUrl)
          .filter(Boolean);

        const uniqueImages = [...new Set(imageUrls)];

        setImages(uniqueImages);
        setSelectedImage(uniqueImages[0] ?? "");

        /*
         * Only active variants should be selectable.
         * VariantSelector handles the initial selection itself.
         */

        const activeVariants = Array.isArray(variantData)
          ? variantData.filter(
              (variant) =>
                String(variant.status).toUpperCase() === "ACTIVE"
            )
          : [];

        setVariants(activeVariants);
      } catch (err) {
        if (!active) return;

        setError(
          err?.response?.data?.message ||
          err.message ||
          "Unable to load product details."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error State
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Product Information
  |--------------------------------------------------------------------------
  */

  const name = product.name ?? "Untitled Product";

  const basePrice = Number(product.base_price ?? 0);

  const selectedPrice = selectedVariant
    ? Number(selectedVariant.final_price)
    : basePrice;

  const selectedStock = selectedVariant
    ? Number(selectedVariant.stock ?? 0)
    : null;

  const isVariantAvailable =
    Boolean(selectedVariant) &&
    selectedStock > 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-8">

        {/* Breadcrumb */}

        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <Link
            to="/"
            className="hover:text-indigo-600"
          >
            Home
          </Link>

          <ChevronRight size={15} />

          <Link
            to="/products"
            className="hover:text-indigo-600"
          >
            Products
          </Link>

          <ChevronRight size={15} />

          <span className="text-zinc-900">
            {name}
          </span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">

          {/* =====================================================
              PRODUCT IMAGE GALLERY
          ====================================================== */}

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
                    aria-label={`View product image ${index + 1}`}
                    className={`aspect-square overflow-hidden rounded-xl border-2 bg-zinc-50 transition ${
                      selectedImage === image
                        ? "border-indigo-600"
                        : "border-transparent hover:border-zinc-300"
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

          {/* =====================================================
              PRODUCT INFORMATION
          ====================================================== */}

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

            {/* Price */}

            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {selectedVariant ? "Variant price" : "Base price"}
              </p>

              <p className="mt-1 text-3xl font-bold text-zinc-900">
                {formatPrice(selectedPrice)}
              </p>

              {selectedVariant && (
                <p className="mt-1 text-xs text-zinc-500">
                  Includes variant price adjustment
                </p>
              )}
            </div>

            {/* =================================================
                VARIANT SELECTION
            ================================================== */}

            <div className="mt-7 space-y-6 border-t border-zinc-100 pt-6">

              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900">
                  Select product options
                </h2>

                {variants.length > 0 && (
                  <span className="text-xs text-zinc-500">
                    {variants.length} available variants
                  </span>
                )}
              </div>

              {variantError && (
                <div className="flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                  <AlertCircle size={18} className="shrink-0" />
                  <p>{variantError}</p>
                </div>
              )}

              {!variantError && (
                <VariantSelector
                  variants={variants}
                  basePrice={basePrice}
                  onVariantChange={setSelectedVariant}
                />
              )}

              {selectedVariant && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        SKU
                      </p>

                      <p className="mt-1 font-semibold text-zinc-800">
                        {selectedVariant.sku}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Availability
                      </p>

                      {Number(selectedVariant.stock) > 0 ? (
                        <p className="mt-1 text-sm font-semibold text-emerald-600">
                          {selectedVariant.stock} units available
                        </p>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-red-600">
                          Out of stock
                        </p>
                      )}
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* =================================================
                DESCRIPTION
            ================================================== */}

            <div className="mt-7 border-t border-zinc-100 pt-6">
              <h2 className="mb-3 font-semibold text-zinc-900">
                Description
              </h2>

              <p className="whitespace-pre-line leading-7 text-zinc-600">
                {product.description ||
                  "No product description is available."}
              </p>
            </div>

            {/* =================================================
                ADD TO CART
            ================================================== */}

            <button
              type="button"
              disabled
              className="mt-8 w-full cursor-not-allowed rounded-xl bg-zinc-300 py-4 font-semibold text-zinc-600"
            >
              Add to Cart — Coming in Phase 6.5
            </button>

            {!isVariantAvailable && selectedVariant && (
              <p className="mt-2 text-center text-sm text-red-600">
                This variant is currently out of stock.
              </p>
            )}

            {/* =================================================
                SHOPPING INFORMATION
            ================================================== */}

            <div className="mt-8 space-y-4 border-t border-zinc-100 pt-6">

              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <Truck
                  size={19}
                  className="text-indigo-600"
                />
                Shipping information available during checkout
              </div>

              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <ShieldCheck
                  size={19}
                  className="text-indigo-600"
                />
                Secure checkout
              </div>

              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <Package
                  size={19}
                  className="text-indigo-600"
                />
                Product information from ShopSphere
              </div>

            </div>
          </div>
        </div>

        {/* Admin Variant Management */}

        {!authLoading && isAdmin && (
          <div className="mt-12 border-t border-zinc-200 pt-8">
            <VariantManagement productId={id} />
          </div>
        )}

      </div>
    </div>
  );
}