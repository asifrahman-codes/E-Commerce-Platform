import { useEffect, useContext, useState } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";

import {
  ChevronRight,
  Package,
  ShieldCheck,
  Truck,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";

import productService from "../../services/product.service";

import ErrorMessage from "../../components/common/ErrorMessage";

import {
  getImageUrl,
  formatPrice,
  getResponsiveImageProps,
} from "../../utils/product.utils";

import { AuthContext } from "../../context/AuthContext";

import VariantManagement from "../../components/products/admin/VariantManagement";

import VariantSelector from "../../components/products/VariantSelector";
import CompareButton from "../../components/products/CompareButton";
import ProductRelatedRecommendations from "../../components/recommendations/ProductRelatedRecommendations";

import { useCart } from "../../context/CartContext";

import ReviewList from "../../components/reviews/ReviewList";
import ProductQuestions from "../../components/products/ProductQuestions";
import { rememberRecentlyViewedProduct } from "../../utils/recentlyViewed";
import { setPageMetadata } from "../../utils/seo.utils";
import WishlistButton from "../../components/wishlist/WishlistButton";
import StorefrontSkeleton from "../../components/common/StorefrontSkeleton";

export default function ProductDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialVariantId = searchParams.get("variant_id");

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

  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");

    const userRole = String(
    user?.role ?? user?.user_role ?? ""
  ).toUpperCase();

  const isAdmin =
      isAuthenticated && userRole === "ADMIN";

  const { addToCart } = useCart();

  const navigate = useNavigate();

  const handleAddToCart = async () => {
  if (!localStorage.getItem("accessToken")) {
    navigate(`/login?redirect=${encodeURIComponent("/cart")}`);
    return;
  }

  if (!selectedVariant) {
    setCartError("Please select a product variant.");
    return;
  }

  if (Number(selectedVariant.stock) < 1) {
    setCartError("This variant is out of stock.");
    return;
  }

  try {
    setAddingToCart(true);
    setCartError("");
    setCartMessage("");

    await addToCart(selectedVariant.variant_id, 1);

    setCartMessage("Product added to your cart successfully.");
  } catch (err) {
    setCartError(
      err.message ||
        "Unable to add this product to your cart."
    );
  } finally {
    setAddingToCart(false);
  }
};

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
        rememberRecentlyViewedProduct({
          product_id: productData.product_id ?? id,
          name: productData.name,
          slug: productData.slug,
          base_price: productData.base_price,
          display_price: productData.base_price,
          brand_name: productData.brand_name,
          primary_image: uniqueImages[0] ?? null,
          total_stock: activeVariants.reduce(
            (total, variant) => total + Number(variant.stock ?? 0),
            0
          ),
          average_rating: productData.average_rating,
          review_count: productData.review_count,
        });
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

  useEffect(() => {
    if (!product) return undefined;

    const title = `${product.name ?? "Product"} | ShopSphere`;
    const description = String(product.description ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160) || "View product details, pricing, and availability on ShopSphere.";
    const configuredSiteUrl = import.meta.env.VITE_SITE_URL;
    const siteOrigin = configuredSiteUrl
      ? new URL(configuredSiteUrl).origin
      : window.location.origin;
    const canonicalUrl = `${siteOrigin}${window.location.pathname}`;
    const imageSources = images.length
      ? images
      : [getImageUrl(
          product.primary_image ??
          product.primary_image_url ??
          product.image_url
        )].filter(Boolean);
    const absoluteImages = imageSources.map(
      (url) => new URL(url, siteOrigin).href
    );
    const image = absoluteImages[0] ?? null;
    const activeVariants = variants.filter(
      (variant) => String(variant.status).toUpperCase() === "ACTIVE"
    );
    const variantPrices = activeVariants
      .map((variant) => Number(variant.final_price))
      .filter((price) => Number.isFinite(price) && price >= 0);
    const inStock = activeVariants.some((variant) => Number(variant.stock) > 0);
    const offers = variantPrices.length
      ? variantPrices.length === 1
        ? {
            "@type": "Offer",
            priceCurrency: "PKR",
            price: variantPrices[0],
            availability: `https://schema.org/${inStock ? "InStock" : "OutOfStock"}`,
            url: canonicalUrl,
          }
        : {
            "@type": "AggregateOffer",
            priceCurrency: "PKR",
            lowPrice: Math.min(...variantPrices),
            highPrice: Math.max(...variantPrices),
            offerCount: variantPrices.length,
            availability: `https://schema.org/${inStock ? "InStock" : "OutOfStock"}`,
            url: canonicalUrl,
          }
      : undefined;
    const rating = Number(product.average_rating);
    const reviewCount = Number(product.review_count);
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description || undefined,
      image: absoluteImages.length ? absoluteImages : undefined,
      sku: product.sku ?? (activeVariants.length === 1 ? activeVariants[0].sku : undefined),
      category: product.category_name || undefined,
      brand: product.brand_name
        ? { "@type": "Brand", name: product.brand_name }
        : undefined,
      offers,
      aggregateRating:
        Number.isFinite(rating) &&
        rating > 0 &&
        rating <= 5 &&
        Number.isSafeInteger(reviewCount) &&
        reviewCount > 0
          ? {
              "@type": "AggregateRating",
              ratingValue: rating,
              reviewCount,
            }
          : undefined,
    };

    setPageMetadata({
      title,
      description,
      canonicalUrl,
      image,
      type: "product",
    });

    const schema = document.createElement("script");
    schema.id = "shopsphere-product-structured-data";
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify(structuredData);
    document.head.appendChild(schema);

    return () => schema.remove();
  }, [product, images, variants]);

  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return <StorefrontSkeleton label="Loading product details" layout="split" />;
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
    <div className="shop-page">
      <div className="container-custom py-6 sm:py-10">

        {/* Breadcrumb */}

        <nav aria-label="Breadcrumb" className="mb-7 flex flex-wrap items-center gap-2 text-sm text-muted">
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
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[1.75rem] border border-line bg-[#f0f3ed]">
              {selectedImage ? (
                <img
                  {...getResponsiveImageProps(selectedImage, {
                    sizes: "(min-width: 1024px) 50vw, 100vw",
                    widths: [640, 960, 1280, 1600],
                    fallbackWidth: 1280,
                  })}
                  alt={name}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
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
                    className={`aspect-square overflow-hidden rounded-xl border-2 bg-white transition ${
                      selectedImage === image
                        ? "border-indigo-600"
                        : "border-transparent hover:border-zinc-300"
                    }`}
                  >
                    <img
                      {...getResponsiveImageProps(image, {
                        sizes: "96px",
                        widths: [128, 256, 384],
                        fallbackWidth: 256,
                      })}
                      alt={`${name} image ${index + 1}`}
                      loading="lazy"
                      decoding="async"
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

            <p className="shop-eyebrow mb-3">
              {product.category_name ?? "Products"}
            </p>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
              {name}
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              Brand: {product.brand_name ?? "Not specified"}
            </p>

            {/* Price */}

            <div className="shop-panel mt-6 p-5 sm:p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {selectedVariant ? "Variant price" : "Base price"}
              </p>

              <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">
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

            <div className="mt-7 space-y-6 border-t border-line pt-6">

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
                  initialVariantId={initialVariantId}
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

                      <p className="mt-1 break-all font-semibold text-zinc-800">
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

            <div className="mt-7 border-t border-line pt-6">
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
              onClick={handleAddToCart}
              disabled={
                addingToCart ||
                !selectedVariant ||
                Number(selectedVariant.stock) < 1
              }
              className="shop-button shop-button-primary mt-8 min-h-14 w-full rounded-full disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              <ShoppingCart size={19} />

              {addingToCart
                ? "Adding..."
                : selectedVariant && Number(selectedVariant.stock) < 1
                  ? "Out of Stock"
                  : "Add to Cart"}
            </button>

            {cartMessage && (
              <p role="status" className="mt-3 text-sm text-green-700">
                {cartMessage}
              </p>
            )}

            {cartError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {cartError}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <CompareButton
                productId={product.product_id ?? id}
              />
              <WishlistButton productId={product.product_id ?? id} />
            </div>

            {!isVariantAvailable && selectedVariant && (
              <p className="mt-2 text-center text-sm text-red-600">
                This variant is currently out of stock.
              </p>
            )}

            {/* =================================================
                SHOPPING INFORMATION
            ================================================== */}

            <div className="mt-8 space-y-4 border-t border-line pt-6">

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

        <ProductRelatedRecommendations productId={id} />
        <ProductQuestions productId={id} />

        <div className="mt-12 border-t border-line pt-8">
          <ReviewList productId={id} />
        </div>

        {!authLoading && isAdmin && (
          <div className="mt-12 border-t border-line pt-8">
            <VariantManagement productId={id} />
          </div>
        )}

      </div>
    </div>
  );
}