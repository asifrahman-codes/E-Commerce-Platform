import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ChevronRight,
  Package,
  ShieldCheck,
  Truck,
  Check,
  AlertCircle,
} from "lucide-react";

import productService from "../../services/product.service";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

import {
  getImageUrl,
  formatPrice,
} from "../../utils/product.utils";

const normalizeValue = (value) =>
  String(value ?? "").trim();

const getUniqueValues = (variants, field) => {
  return [
    ...new Set(
      variants
        .map((variant) => normalizeValue(variant[field]))
        .filter(Boolean)
    ),
  ];
};

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");

  const [variants, setVariants] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [variantError, setVariantError] = useState("");

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
      setSelectedSize("");
      setSelectedColor("");

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
         */

        const activeVariants = Array.isArray(variantData)
          ? variantData.filter(
              (variant) =>
                String(variant.status).toUpperCase() === "ACTIVE"
            )
          : [];

        setVariants(activeVariants);

        /*
         * Initialize selection from the first available variant.
         */

        if (activeVariants.length > 0) {
          const firstVariant = activeVariants[0];

          setSelectedSize(
            normalizeValue(firstVariant.size)
          );

          setSelectedColor(
            normalizeValue(firstVariant.color)
          );
        }
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
  | Available Sizes and Colors
  |--------------------------------------------------------------------------
  */

  const availableSizes = useMemo(
    () => getUniqueValues(variants, "size"),
    [variants]
  );

  const availableColors = useMemo(() => {
    const matchingVariants = selectedSize
      ? variants.filter(
          (variant) =>
            normalizeValue(variant.size) === selectedSize
        )
      : variants;

    return getUniqueValues(matchingVariants, "color");
  }, [variants, selectedSize]);

  /*
  |--------------------------------------------------------------------------
  | Selected Variant
  |--------------------------------------------------------------------------
  */

  const selectedVariant = useMemo(() => {
    return (
      variants.find(
        (variant) =>
          normalizeValue(variant.size) === selectedSize &&
          normalizeValue(variant.color) === selectedColor
      ) ?? null
    );
  }, [variants, selectedSize, selectedColor]);

  /*
  |--------------------------------------------------------------------------
  | Handle Size Selection
  |--------------------------------------------------------------------------
  */

  const handleSizeChange = (size) => {
    setSelectedSize(size);

    const matchingVariants = variants.filter(
      (variant) =>
        normalizeValue(variant.size) === size
    );

    const matchingColor = matchingVariants.find(
      (variant) =>
        normalizeValue(variant.color) === selectedColor
    );

    setSelectedColor(
      matchingColor
        ? normalizeValue(matchingColor.color)
        : normalizeValue(matchingVariants[0]?.color)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Handle Color Selection
  |--------------------------------------------------------------------------
  */

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

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
                  <AlertCircle
                    size={18}
                    className="shrink-0"
                  />
                  <p>{variantError}</p>
                </div>
              )}

              {!variantError && variants.length === 0 && (
                <div className="rounded-xl bg-zinc-50 p-4">
                  <p className="text-sm text-zinc-600">
                    No active variants are currently available for this product.
                  </p>
                </div>
              )}

              {/* Size selection */}

              {availableSizes.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-semibold text-zinc-800">
                      Size
                    </label>

                    <span className="text-sm text-zinc-500">
                      {selectedSize || "Select size"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => {
                      const isSelected = selectedSize === size;

                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizeChange(size)}
                          aria-pressed={isSelected}
                          className={`min-w-12 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-zinc-200 text-zinc-700 hover:border-indigo-400"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color selection */}

              {availableColors.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-semibold text-zinc-800">
                      Color
                    </label>

                    <span className="text-sm text-zinc-500">
                      {selectedColor || "Select color"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => {
                      const isSelected = selectedColor === color;

                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleColorChange(color)}
                          aria-pressed={isSelected}
                          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                              : "border-zinc-200 text-zinc-700 hover:border-indigo-400"
                          }`}
                        >
                          {isSelected && (
                            <Check size={15} />
                          )}

                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected variant information */}

              {selectedVariant ? (
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

                      {selectedStock > 0 ? (
                        <p className="mt-1 text-sm font-semibold text-emerald-600">
                          {selectedStock} units available
                        </p>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-red-600">
                          Out of stock
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : variants.length > 0 ? (
                <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
                  Please select an available size and color combination.
                </div>
              ) : null}

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
      </div>
    </div>
  );
}