import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftRight, Package, ShoppingCart, Trash2 } from "lucide-react";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useCart } from "../../context/CartContext";
import { useProductComparison } from "../../context/ProductComparisonContext";
import productService from "../../services/product.service";
import { formatPrice, getImageUrl, getResponsiveImageProps } from "../../utils/product.utils";

function priceRange(product) {
  const min = Number(product.price_min ?? product.base_price);
  const max = Number(product.price_max ?? product.base_price);
  return min === max
    ? formatPrice(min)
    : `${formatPrice(min)} - ${formatPrice(max)}`;
}

function displayValues(values) {
  return Array.isArray(values) && values.length
    ? values.join(", ")
    : "-";
}

function rowValue(product, key) {
  switch (key) {
    case "category":
      return product.category_name || "-";
    case "brand":
      return product.brand_name || "-";
    case "price":
      return priceRange(product);
    case "availability":
      return product.available ? "In stock" : "Out of stock";
    case "stock":
      return String(Number(product.total_stock ?? 0));
    case "sizes":
      return displayValues(product.available_attributes?.sizes);
    case "colors":
      return displayValues(product.available_attributes?.colors);
    case "skus":
      return displayValues(product.available_attributes?.skus);
    case "description":
      return product.description?.trim() || "-";
    default:
      return "—";
  }
}

function hasDifferences(values) {
  return new Set(values.map((value) => value.trim().toLocaleLowerCase())).size > 1;
}

export default function ProductComparison() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const {
    productIds,
    count,
    maxProducts,
    clearComparison,
    removeProduct,
  } = useProductComparison();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [addingProductId, setAddingProductId] = useState(null);
  const [cartMessages, setCartMessages] = useState({});
  const idsKey = productIds.join(",");

  useEffect(() => {
    let active = true;

    if (!idsKey) {
      setProducts([]);
      setError("");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError("");
    productService.getProductsForComparison(
      idsKey.split(",").map(Number)
    )
      .then((result) => {
        if (active) setProducts(result);
      })
      .catch((loadError) => {
        if (!active) return;
        setProducts([]);
        setError(
          loadError?.response?.data?.message ||
          loadError?.message ||
          "Unable to load product comparison."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [idsKey, retry]);

  const rows = useMemo(() => {
    const definitions = [
      { key: "category", label: "Category" },
      { key: "brand", label: "Brand" },
      { key: "price", label: "Price" },
      { key: "availability", label: "Availability" },
      { key: "stock", label: "Available stock" },
      { key: "sizes", label: "Sizes" },
      { key: "colors", label: "Colors" },
      { key: "skus", label: "SKUs" },
      { key: "description", label: "Description" },
    ];

    return definitions
      .map((row) => ({
        ...row,
        values: products.map((product) => rowValue(product, row.key)),
      }))
      .filter((row) =>
        !["sizes", "colors", "skus"].includes(row.key) ||
        row.values.some((value) => value !== "-")
      );
  }, [products]);

  const getSelectedVariant = (product) => {
    const variants = product.variants ?? [];
    const selectedVariantId = selectedVariants[Number(product.product_id)];
    return variants.find(
      (variant) => Number(variant.variant_id) === Number(selectedVariantId)
    ) ??
      variants.find((variant) => Number(variant.stock) > 0) ??
      variants[0] ??
      null;
  };

  const handleAddToCart = async (product) => {
    const productId = Number(product.product_id);
    const selectedVariant = getSelectedVariant(product);

    if (!localStorage.getItem("accessToken")) {
      navigate(`/login?redirect=${encodeURIComponent("/cart")}`);
      return;
    }
    if (!selectedVariant || Number(selectedVariant.stock) < 1) return;

    setAddingProductId(productId);
    setCartMessages((previous) => ({ ...previous, [productId]: "" }));
    try {
      await addToCart(selectedVariant.variant_id, 1);
      setCartMessages((previous) => ({
        ...previous,
        [productId]: "Added to cart.",
      }));
    } catch (addError) {
      setCartMessages((previous) => ({
        ...previous,
        [productId]:
          addError?.response?.data?.message ||
          addError?.message ||
          "Unable to add this variant to your cart.",
      }));
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <section className="container-custom py-8 sm:py-12">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600">
            <ArrowLeftRight size={20} />
            <p className="text-sm font-semibold uppercase tracking-wide">
              Product comparison
            </p>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-zinc-900">
            Compare products
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Compare up to {maxProducts} products using their available product and variant data.
          </p>
        </div>
        {count > 0 && (
          <button
            type="button"
            onClick={clearComparison}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-600 hover:border-red-200 hover:text-red-600"
          >
            <Trash2 size={16} />
            Clear comparison
          </button>
        )}
      </header>

      {count < maxProducts && count > 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          <span>
            {count === 1
              ? "Add another product to compare side by side."
              : `${maxProducts - count} comparison ${maxProducts - count === 1 ? "slot" : "slots"} remaining.`}
          </span>
          <Link to="/products" className="font-semibold underline underline-offset-2">
            Browse products
          </Link>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-semibold">Comparison could not be loaded</p>
          <p className="mt-1 text-sm">{error}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="min-h-11 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={clearComparison}
              className="min-h-11 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold"
            >
              Clear comparison
            </button>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <ArrowLeftRight size={34} className="mx-auto text-zinc-300" />
          <h2 className="mt-3 text-lg font-semibold text-zinc-800">
            No products selected
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Add products from the catalog or a product details page to compare them here.
          </p>
          <Link
            to="/products"
            className="mt-5 inline-flex min-h-11 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Browse products
          </Link>
        </div>
        ) : (
          <>
            <p className="mb-2 text-xs text-zinc-500 sm:hidden">
              Swipe horizontally to see every comparison field.
            </p>

            <div
              role="region"
              aria-label="Side-by-side product comparison"
              tabIndex={0}
              className="overflow-x-auto overscroll-x-contain rounded-2xl border border-zinc-200 bg-white shadow-sm focus-visible:outline-indigo-600"
            >
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 z-10 w-40 bg-zinc-50 p-4 text-sm font-semibold text-zinc-600">
                  Product details
                </th>
                {products.map((product) => {
                  const productId = Number(product.product_id);
                  const variants = product.variants ?? [];
                  const selectedVariant = getSelectedVariant(product);
                  const image = getImageUrl(product.primary_image);
                  return (
                    <th
                      key={productId}
                      scope="col"
                      className="w-64 min-w-64 border-l border-zinc-200 p-4 align-top font-normal"
                    >
                      <div className="flex h-full flex-col">
                        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-zinc-50">
                          {image ? (
                            <img
                              {...getResponsiveImageProps(image, {
                                sizes: "256px",
                                widths: [256, 512, 768],
                                fallbackWidth: 512,
                              })}
                              alt={product.name}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-contain p-3"
                            />
                          ) : (
                            <Package size={38} className="text-zinc-300" />
                          )}
                        </div>
                        <Link
                          to={`/products/${productId}`}
                          className="mt-3 line-clamp-2 font-semibold text-zinc-900 hover:text-indigo-700"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-1 text-xs text-zinc-500">
                          {product.brand_name || "-"}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeProduct(productId)}
                          className="mt-2 min-h-11 self-start rounded-lg px-3 text-xs font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600"
                        >
                          Remove
                        </button>

                        <label className="mt-4 block text-left text-xs font-semibold text-zinc-600">
                          Variant
                          <select
                            value={selectedVariant?.variant_id ?? ""}
                            disabled={!variants.length}
                            onChange={(event) => {
                              const variant = variants.find(
                                (item) => String(item.variant_id) === event.target.value
                              );
                              if (variant) {
                                setSelectedVariants((previous) => ({
                                  ...previous,
                                  [productId]: variant.variant_id,
                                }));
                              }
                            }}
                            className="mt-1 min-h-11 w-full rounded-lg border border-zinc-200 bg-white px-2 py-2 text-base font-normal text-zinc-700 disabled:bg-zinc-100 sm:text-xs"
                          >
                            {variants.length ? variants.map((variant) => {
                              const attributes = [
                                variant.size,
                                variant.color,
                                variant.sku,
                              ].filter(Boolean).join(" / ");
                              return (
                                <option
                                  key={variant.variant_id}
                                  value={variant.variant_id}
                                  disabled={Number(variant.stock) < 1}
                                >
                                  {attributes} / {formatPrice(variant.final_price)} / {Number(variant.stock) > 0 ? `${variant.stock} available` : "Out of stock"}
                                </option>
                              );
                            }) : (
                              <option value="">No active variants</option>
                            )}
                          </select>
                        </label>
                        <p className="mt-2 text-left text-sm font-bold text-zinc-900">
                          {selectedVariant
                            ? formatPrice(selectedVariant.final_price)
                            : priceRange(product)}
                        </p>
                        <button
                          type="button"
                          disabled={
                            !selectedVariant ||
                            Number(selectedVariant.stock) < 1 ||
                            addingProductId !== null
                          }
                          onClick={() => void handleAddToCart(product)}
                          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
                        >
                          <ShoppingCart size={15} />
                          {addingProductId === productId
                            ? "Adding..."
                            : selectedVariant && Number(selectedVariant.stock) < 1
                              ? "Out of stock"
                              : selectedVariant
                                ? "Add to cart"
                                : "Unavailable"}
                        </button>
                        {cartMessages[productId] && (
                          <p role="status" className="mt-2 text-left text-xs text-zinc-600">
                            {cartMessages[productId]}
                          </p>
                        )}
                      </div>
                    </th>
                  );
                })}
                {count < maxProducts && (
                  <th scope="col" className="w-48 border-l border-zinc-200 p-4 align-middle text-center font-normal">
                    <Link to="/products" className="inline-flex flex-col items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
                        <ArrowLeftRight size={20} />
                      </span>
                      Add a product
                    </Link>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const different = hasDifferences(row.values);
                return (
                  <tr key={row.key} className="border-t border-zinc-200">
                    <th scope="row" className="sticky left-0 z-10 bg-zinc-50 p-4 text-sm font-semibold text-zinc-700">
                      {row.label}
                    </th>
                    {row.values.map((value, index) => (
                      <td
                        key={`${row.key}-${products[index].product_id}`}
                        className={`max-w-72 border-l border-zinc-200 p-4 align-top text-sm leading-6 text-zinc-700 ${
                          different ? "bg-amber-50/70" : ""
                        }`}
                      >
                        {value}
                      </td>
                    ))}
                    {count < maxProducts && (
                      <td className="border-l border-zinc-200 bg-zinc-50/50" aria-hidden="true" />
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="border-t border-zinc-100 px-4 py-3 text-xs text-zinc-500">
            Swipe horizontally on smaller screens to view all compared products. Variant prices include each product’s stored price adjustment.
          </p>
    
      </div>
      </>
        )}
    </section>
  );
}
