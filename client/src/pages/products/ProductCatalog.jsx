import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Clock3,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import brandService from "../../services/brand.service";
import categoryService from "../../services/category.service";
import productService from "../../services/product.service";
import ProductGrid from "../../components/products/ProductGrid";
import ErrorMessage from "../../components/common/ErrorMessage";
import { formatPrice, getResponsiveImageProps } from "../../utils/product.utils";
import { getRecentlyViewedProducts } from "../../utils/recentlyViewed";
import useDialogFocus from "../../hooks/useDialogFocus";
import { semanticSearchProducts } from "../../services/semantic-search.service";

const DEFAULT_FILTERS = {
  q: "",
  category_id: "",
  brand_id: "",
  min_price: "",
  max_price: "",
  in_stock: "",
  sort: "newest",
};

const SORT_OPTIONS = [
  ["newest", "Newest"],
  ["price_asc", "Price: low to high"],
  ["price_desc", "Price: high to low"],
  ["popularity", "Most popular"],
  ["best_selling", "Best selling"],
  ["rating_desc", "Top rated"],
  ["name_asc", "Name: A to Z"],
];

function readFilters(params) {
  return {
    q: params.get("q") || "",
    category_id: params.get("category_id") || "",
    brand_id: params.get("brand_id") || "",
    min_price: params.get("min_price") || "",
    max_price: params.get("max_price") || "",
    in_stock: params.get("in_stock") || "",
    sort: params.get("sort") || DEFAULT_FILTERS.sort,
  };
}

function getPage(params) {
  const page = Number(params.get("page") || 1);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function visiblePages(page, totalPages) {
  const first = Math.max(1, Math.min(page - 2, totalPages - 4));
  const last = Math.min(totalPages, first + 4);
  return Array.from({ length: Math.max(0, last - first + 1) }, (_, index) => first + index);
}

export default function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedFilters = useMemo(() => readFilters(searchParams), [searchParams]);
  const page = getPage(searchParams);
  const [filters, setFilters] = useState(appliedFilters);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [recentProducts] = useState(() => getRecentlyViewedProducts());
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metadataError, setMetadataError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const filtersDialogRef = useRef(null);
  const [view, setView] = useState("grid");
  const [focusedSearch, setFocusedSearch] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [aiSearch, setAiSearch] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState(null);
  const [searchMethod, setSearchMethod] = useState("");

  useDialogFocus(filtersDialogRef, showFilters, () => setShowFilters(false));

  useEffect(() => {
    setFilters(appliedFilters);
  }, [appliedFilters]);

  useEffect(() => {
    let active = true;

    Promise.all([
      categoryService.getCategories(),
      brandService.getBrands(),
    ])
      .then(([categoryData, brandData]) => {
        if (!active) return;
        setCategories(categoryData.filter(
          (category) => String(category.status ?? "ACTIVE").toUpperCase() === "ACTIVE"
        ));
        setBrands(brandData.filter(
          (brand) => String(brand.status ?? "ACTIVE").toUpperCase() === "ACTIVE"
        ));
        setMetadataError("");
      })
      .catch((loadError) => {
        console.error("Catalog filter options could not be loaded:", loadError);
        if (active) {
          setMetadataError("Some catalog filters are temporarily unavailable.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = { page, limit: 12 };
        Object.entries(appliedFilters).forEach(([key, value]) => {
          if (value !== "" && value !== DEFAULT_FILTERS[key]) {
            params[key] = value;
          }
        });

        const result = aiSearch && appliedFilters.q
          ? await semanticSearchProducts(params)
          : await productService.getProducts(params);
        if (!active) return;
        setProducts(result.products);
        setPagination(result.pagination);
        if (aiSearch && appliedFilters.q) {
          setAiInterpretation(result.interpreted_search_intent || result.interpreted_intent);
          setSearchMethod(result.used_ai_interpretation
            ? "AI interpretation"
            : result.fallback_used
              ? "Keyword fallback"
              : "AI interpretation");
        } else {
          setAiInterpretation(null);
          setSearchMethod("");
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError?.message ||
            "Unable to load products. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }, appliedFilters.q ? 180 : 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [appliedFilters, page, aiSearch]);

  useEffect(() => {
    let active = true;
    const query = filters.q.trim();

    if (!focusedSearch || query.length < 2) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const result = await productService.getProducts({
          q: query,
          page: 1,
          limit: 5,
          sort: "popularity",
        });
        if (active) setSuggestions(result.products);
      } catch (suggestionError) {
        if (active) setSuggestions([]);
        console.error("Product search suggestions could not be loaded:", suggestionError);
      } finally {
        if (active) setSuggestionsLoading(false);
      }
    }, 220);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [filters.q, focusedSearch]);

  const writeFiltersToUrl = (nextFilters, nextPage = 1, options = {}) => {
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value !== "" && value !== DEFAULT_FILTERS[key]) {
        params.set(key, String(value));
      }
    });
    if (nextPage > 1) params.set("page", String(nextPage));
    setSearchParams(params, options);
  };

  const updateFilter = (key, value, shouldApply = true) => {
    const nextFilters = { ...filters, [key]: value };
    if (shouldApply && key !== "min_price" && key !== "max_price") {
      nextFilters.min_price = appliedFilters.min_price;
      nextFilters.max_price = appliedFilters.max_price;
    }
    setFilters(nextFilters);
    if (shouldApply) {
      writeFiltersToUrl(nextFilters, 1, { replace: key === "q" });
    }
  };

  const applyFilters = (event) => {
    event.preventDefault();
    const min = filters.min_price === "" ? null : Number(filters.min_price);
    const max = filters.max_price === "" ? null : Number(filters.max_price);
    if (min !== null && (!Number.isFinite(min) || min < 0)) {
      setError("Enter a valid minimum price.");
      return;
    }
    if (max !== null && (!Number.isFinite(max) || max < 0)) {
      setError("Enter a valid maximum price.");
      return;
    }
    if (min !== null && max !== null && min > max) {
      setError("Minimum price cannot be greater than maximum price.");
      return;
    }
    setError("");
    writeFiltersToUrl(filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams({});
    setShowFilters(false);
  };

  const changePage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    writeFiltersToUrl(appliedFilters, nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeFilter = (key) => {
    if (key === "price") {
      const next = { ...filters, min_price: "", max_price: "" };
      setFilters(next);
      writeFiltersToUrl(next);
      return;
    }
    updateFilter(key, "");
  };

  const activeChips = [];
  if (appliedFilters.q) activeChips.push({ key: "q", label: `Search: ${appliedFilters.q}` });
  if (appliedFilters.category_id) {
    const category = categories.find((item) =>
      String(item.category_id ?? item.id) === appliedFilters.category_id
    );
    activeChips.push({
      key: "category_id",
      label: category?.name ?? category?.category_name ?? "Category",
    });
  }
  if (appliedFilters.brand_id) {
    const brand = brands.find((item) =>
      String(item.brand_id ?? item.id) === appliedFilters.brand_id
    );
    activeChips.push({ key: "brand_id", label: brand?.name ?? "Brand" });
  }
  if (appliedFilters.min_price || appliedFilters.max_price) {
    activeChips.push({
      key: "price",
      label: `${appliedFilters.min_price ? formatPrice(appliedFilters.min_price) : "Any"} – ${appliedFilters.max_price ? formatPrice(appliedFilters.max_price) : "Any"}`,
    });
  }
  if (appliedFilters.in_stock) {
    activeChips.push({
      key: "in_stock",
      label: appliedFilters.in_stock === "true" ? "In stock" : "Out of stock",
    });
  }

  const selectedCategory = appliedFilters.category_id;

  return (
    <div className="premium-page">
      <div className="container-custom py-8 sm:py-10">
        <div className="mb-7">
          <p className="shop-eyebrow mb-2">
            ShopSphere Collection
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {appliedFilters.q ? `Results for “${appliedFilters.q}”` : "Discover your next favorite"}
          </h1>
          <p className="mt-2 text-muted">
            Find something useful, lovely, or a little unexpected.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setAiSearch((current) => !current)}
            aria-pressed={aiSearch}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition ${
              aiSearch
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-zinc-200 bg-white text-zinc-700"
            }`}
          >
            <Sparkles size={16} />
            AI search
          </button>
          <form
            onSubmit={applyFilters}
            className="relative flex flex-1 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50"
          >
            <Search size={19} className="shrink-0 text-zinc-400" />
            <input
              value={filters.q}
              onChange={(event) => updateFilter("q", event.target.value)}
              onFocus={() => setFocusedSearch(true)}
              onBlur={() => window.setTimeout(() => setFocusedSearch(false), 150)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setFocusedSearch(false);
              }}
              aria-label="Search products"
              aria-autocomplete="list"
              aria-expanded={focusedSearch && filters.q.trim().length >= 2}
              aria-controls="catalog-search-suggestions"
              autoComplete="off"
              placeholder="Search products, brands, or SKU..."
              className="min-h-11 min-w-0 flex-1 border-0 bg-transparent py-3 text-base outline-none sm:text-sm"
            />
            {filters.q && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => updateFilter("q", "")}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="min-h-11 shrink-0 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Search
            </button>

            {focusedSearch && filters.q.trim().length >= 2 && (
              <div
                id="catalog-search-suggestions"
                role="region"
                aria-label="Search suggestions"
                className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl"
              >
                {suggestionsLoading ? (
                  <p className="px-3 py-4 text-sm text-zinc-500">Searching catalog…</p>
                ) : suggestions.length ? (
                  <>
                    <div id="catalog-search-options" role="listbox" aria-label="Matching products">
                      {suggestions.map((product) => (
                        <Link
                          key={product.product_id}
                          to={`/products/${product.product_id}`}
                          role="option"
                          aria-selected="false"
                          onClick={() => setFocusedSearch(false)}
                          className="flex items-center gap-3 rounded-xl p-2 hover:bg-zinc-50"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100">
                            {(product.primary_image ?? product.primary_image_url) ? (
                              <img
                                {...getResponsiveImageProps(product.primary_image ?? product.primary_image_url, {
                                  sizes: "48px",
                                  widths: [128, 256],
                                  fallbackWidth: 128,
                                })}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-contain p-1"
                              />
                            ) : (
                              <Search size={16} className="text-zinc-400" />
                            )}
                          </div>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-zinc-800">{product.name}</span>
                            <span className="block text-xs text-zinc-500">{product.brand_name} · {formatPrice(product.display_price)}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                    <button
                      type="submit"
                      onMouseDown={(event) => event.preventDefault()}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                    >
                      Search all results for “{filters.q.trim()}”
                    </button>
                  </>
                ) : (
                  <p className="px-3 py-4 text-sm text-zinc-500">
                    {filters.q.trim().length >= 2 ? "No matching products found." : "Keep typing to search."}
                  </p>
                )}
              </div>
            )}
          </form>

          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 text-sm font-semibold text-zinc-700 shadow-sm lg:hidden"
          >
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>

        {aiSearch && aiInterpretation && (
          <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-xs text-indigo-950">
            <Sparkles size={15} className="text-indigo-600" />
            <span className="font-semibold">{searchMethod}</span>
            {aiInterpretation.category && <span className="rounded-full bg-white px-2.5 py-1">Category: {aiInterpretation.category}</span>}
            {aiInterpretation.brand_preferences?.length > 0 && (
              <span className="rounded-full bg-white px-2.5 py-1">
                Brand: {aiInterpretation.brand_preferences.join(", ")}
              </span>
            )}
            {(aiInterpretation.budget_range?.min != null || aiInterpretation.budget_range?.max != null) && (
              <span className="rounded-full bg-white px-2.5 py-1">
                Budget: {aiInterpretation.budget_range.min ?? 0}–{aiInterpretation.budget_range.max ?? "Any"}
              </span>
            )}
          </div>
        )}

        {categories.length > 0 && (
          <nav aria-label="Shop by category" className="mb-7 flex gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => updateFilter("category_id", "")}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                !selectedCategory ? "bg-indigo-600 text-white" : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:text-indigo-600"
              }`}
            >
              All products
            </button>
            {categories.map((category) => {
              const id = String(category.category_id ?? category.id);
              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => updateFilter("category_id", id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedCategory === id ? "bg-indigo-600 text-white" : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:text-indigo-600"
                  }`}
                >
                  {category.name ?? category.category_name}
                </button>
              );
            })}
          </nav>
        )}

        {showFilters && (
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setShowFilters(false)}
            className="fixed inset-0 z-40 bg-zinc-950/40 lg:hidden"
          />
        )}

        <div className="grid gap-7 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside
            role={showFilters ? "dialog" : undefined}
            aria-modal={showFilters ? "true" : undefined}
            aria-labelledby="catalog-filter-title"
            tabIndex={showFilters ? -1 : undefined}
            ref={filtersDialogRef}
            className={`${
              showFilters
                ? "fixed inset-y-0 left-0 z-50 block w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-r-3xl bg-white p-5 shadow-2xl"
                : "hidden"
            } h-fit border border-zinc-200 bg-white p-5 lg:sticky lg:top-6 lg:block lg:rounded-2xl lg:shadow-sm`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 id="catalog-filter-title" className="text-base font-semibold text-zinc-900">Filters</h2>
              <div className="flex items-center gap-3">
                <button type="button" onClick={clearFilters} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                  Clear all
                </button>
                <button type="button" aria-label="Close filters" onClick={() => setShowFilters(false)} className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 lg:hidden">
                  <X size={18} />
                </button>
              </div>
            </div>

            {metadataError && <p className="mb-4 text-xs text-amber-700">{metadataError}</p>}

            <form onSubmit={applyFilters} className="space-y-6">
              <div>
                <label htmlFor="catalog-category" className="mb-2 block text-sm font-semibold text-zinc-800">Category</label>
                <select
                  id="catalog-category"
                  value={filters.category_id}
                  onChange={(event) => updateFilter("category_id", event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-base outline-none focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => {
                    const id = category.category_id ?? category.id;
                    return <option key={id} value={id}>{category.name ?? category.category_name}</option>;
                  })}
                </select>
              </div>

              <div>
                <label htmlFor="catalog-brand" className="mb-2 block text-sm font-semibold text-zinc-800">Brand</label>
                <select
                  id="catalog-brand"
                  value={filters.brand_id}
                  onChange={(event) => updateFilter("brand_id", event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-base outline-none focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">All brands</option>
                  {brands.map((brand) => {
                    const id = brand.brand_id ?? brand.id;
                    return <option key={id} value={id}>{brand.name}</option>;
                  })}
                </select>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-zinc-800">Price range (PKR)</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={filters.min_price}
                    onChange={(event) => updateFilter("min_price", event.target.value, false)}
                    placeholder="Min"
                    aria-label="Minimum price"
                    className="min-h-11 min-w-0 rounded-xl border border-zinc-200 px-3 py-2.5 text-base outline-none focus:border-indigo-500 sm:text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={filters.max_price}
                    onChange={(event) => updateFilter("max_price", event.target.value, false)}
                    placeholder="Max"
                    aria-label="Maximum price"
                    className="min-h-11 min-w-0 rounded-xl border border-zinc-200 px-3 py-2.5 text-base outline-none focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="catalog-availability" className="mb-2 block text-sm font-semibold text-zinc-800">Availability</label>
                <select
                  id="catalog-availability"
                  value={filters.in_stock}
                  onChange={(event) => updateFilter("in_stock", event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-base outline-none focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">All products</option>
                  <option value="true">In stock</option>
                  <option value="false">Out of stock</option>
                </select>
              </div>

              <div className="flex gap-2 border-t border-zinc-100 pt-4">
                <button type="submit" className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
                  Apply filters
                </button>
                <button type="button" onClick={() => setShowFilters(false)} className="rounded-xl border border-zinc-200 px-4 text-sm font-semibold text-zinc-700 lg:hidden">
                  Done
                </button>
              </div>
            </form>
          </aside>

          <section className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-500" aria-live="polite">
                {loading ? "Finding products…" : `${pagination.total.toLocaleString()} ${pagination.total === 1 ? "product" : "products"}`}
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="catalog-sort" className="sr-only">Sort products</label>
                <select
                  id="catalog-sort"
                  value={filters.sort}
                  onChange={(event) => updateFilter("sort", event.target.value)}
                  className="max-w-52 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 outline-none focus:border-indigo-500"
                >
                  {SORT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <div className="flex rounded-xl border border-zinc-200 bg-white p-1">
                  <button type="button" aria-label="Grid view" aria-pressed={view === "grid"} onClick={() => setView("grid")} className={`rounded-lg p-2 ${view === "grid" ? "bg-zinc-100 text-indigo-600" : "text-zinc-400 hover:text-zinc-700"}`}>
                    <LayoutGrid size={17} />
                  </button>
                  <button type="button" aria-label="List view" aria-pressed={view === "list"} onClick={() => setView("list")} className={`rounded-lg p-2 ${view === "list" ? "bg-zinc-100 text-indigo-600" : "text-zinc-400 hover:text-zinc-700"}`}>
                    <List size={17} />
                  </button>
                </div>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <button
                    type="button"
                    key={chip.key}
                    onClick={() => removeFilter(chip.key)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    {chip.label}<X size={13} />
                  </button>
                ))}
                <button type="button" onClick={clearFilters} className="px-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900">
                  Clear all
                </button>
              </div>
            )}

            {loading ? (
              <ProductGrid loading view={view} />
            ) : error ? (
              <ErrorMessage message={error} onRetry={() => setSearchParams(new URLSearchParams(searchParams))} />
            ) : (
              <>
                <ProductGrid
                  products={products}
                  view={view}
                  emptyMessage={appliedFilters.q
                    ? `We couldn't find products matching “${appliedFilters.q}”. Try another search or clear your filters.`
                    : "No products match these filters. Try adjusting your search."}
                />
                {pagination.totalPages > 1 && (
                  <nav aria-label="Product pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={!pagination.hasPreviousPage}
                      onClick={() => changePage(page - 1)}
                      className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    {visiblePages(page, pagination.totalPages).map((number) => (
                      <button
                        type="button"
                        key={number}
                        aria-current={page === number ? "page" : undefined}
                        onClick={() => changePage(number)}
                        className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold ${
                          page === number ? "bg-indigo-600 text-white" : "border border-zinc-200 bg-white text-zinc-700 hover:border-indigo-400"
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={!pagination.hasNextPage}
                      onClick={() => changePage(page + 1)}
                      className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            )}
          </section>
        </div>

        {!loading && recentProducts.length > 0 && (
          <section className="mt-14 border-t border-zinc-200 pt-8">
            <div className="mb-5 flex items-center gap-2">
              <Clock3 size={18} className="text-indigo-600" />
              <h2 className="text-xl font-bold text-zinc-900">Recently viewed</h2>
            </div>
            <ProductGrid products={recentProducts.slice(0, 4)} />
          </section>
        )}
      </div>
    </div>
  );
}
