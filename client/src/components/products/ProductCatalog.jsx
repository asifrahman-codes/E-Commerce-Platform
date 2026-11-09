import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";

import productService from "../../services/product.service";
import categoryService from "../../services/category.service";

import ProductGrid from "../../components/products/ProductGrid";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

const initialFilters = {
  q: "",
  category_id: "",
  brand_id: "",
  min_price: "",
  max_price: "",
  in_stock: false,
  sort: "",
};

export default function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(() => ({
    ...initialFilters,
    q: searchParams.get("q") || "",
    category_id: searchParams.get("category_id") || "",
    brand_id: searchParams.get("brand_id") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    in_stock: searchParams.get("in_stock") === "true",
    sort: searchParams.get("sort") || "",
  }));

  const [page, setPage] = useState(
    Number(searchParams.get("page") || 1)
  );

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const data = await categoryService.getCategories();

        if (active) {
          setCategories(data);
        }
      } catch (err) {
        console.error("Category loading failed:", err);
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const params = {
          page,
          limit: 12,
        };

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== "" && value !== false) {
            params[key] = value;
          }
        });

        const result = await productService.getProducts(params);

        if (!active) return;

        setProducts(result.products);
        setPagination(result.pagination);
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.message ||
            "Unable to load products. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [filters, page]);

  const updateFilter = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const applyFilters = (event) => {
    event.preventDefault();

    const params = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== false) {
        params[key] = String(value);
      }
    });

    params.page = "1";

    setPage(1);
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setPage(1);
    setSearchParams({});
  };

  const changePage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;

    setPage(nextPage);

    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));

    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-10">

        {/* Page heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
            ShopSphere Collection
          </p>

          <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
            Explore Products
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-500">
            Discover products, compare prices, and find what you need.
          </p>
        </div>

        {/* Search and mobile filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <form
            onSubmit={applyFilters}
            className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-200 px-4"
          >
            <Search size={19} className="text-zinc-400" />

            <input
              value={filters.q}
              onChange={(e) => updateFilter("q", e.target.value)}
              placeholder="Search products..."
              className="w-full border-0 bg-transparent py-3 outline-none"
            />

            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
            >
              Search
            </button>
          </form>

          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 lg:hidden"
          >
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[250px_1fr]">

          {/* Filters */}
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } h-fit rounded-2xl border border-zinc-200 p-5 lg:block`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-zinc-900">
                Filters
              </h2>

              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-indigo-600"
              >
                Clear all
              </button>
            </div>

            <form onSubmit={applyFilters} className="space-y-6">

              {/* Category */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-zinc-800">
                  Category
                </label>

                <select
                  value={filters.category_id}
                  onChange={(e) =>
                    updateFilter("category_id", e.target.value)
                  }
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="">All Categories</option>

                  {categories.map((category) => {
                    const id =
                      category.category_id ?? category.id;

                    return (
                      <option key={id} value={id}>
                        {category.name ?? category.category_name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-zinc-800">
                  Brand ID
                </label>

                <input
                  type="number"
                  min="1"
                  value={filters.brand_id}
                  onChange={(e) =>
                    updateFilter("brand_id", e.target.value)
                  }
                  placeholder="Enter brand ID"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* Price */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-zinc-800">
                  Price Range (PKR)
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    value={filters.min_price}
                    onChange={(e) =>
                      updateFilter("min_price", e.target.value)
                    }
                    placeholder="Min"
                    className="min-w-0 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                  />

                  <input
                    type="number"
                    min="0"
                    value={filters.max_price}
                    onChange={(e) =>
                      updateFilter("max_price", e.target.value)
                    }
                    placeholder="Max"
                    className="min-w-0 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Stock */}
              <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={filters.in_stock}
                  onChange={(e) =>
                    updateFilter("in_stock", e.target.checked)
                  }
                  className="h-4 w-4 accent-indigo-600"
                />

                Only show in-stock products
              </label>

              {/* Sort */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-zinc-800">
                  Sort By
                </label>

                <select
                  value={filters.sort}
                  onChange={(e) =>
                    updateFilter("sort", e.target.value)
                  }
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="">Default</option>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Apply Filters
              </button>
            </form>
          </aside>

          {/* Products */}
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">
                {pagination.total
                  ? `${pagination.total} products found`
                  : "Products"}
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-zinc-500 hover:text-indigo-600"
              >
                <X size={15} />
                Reset filters
              </button>
            </div>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <ErrorMessage
                message={error}
                onRetry={() => setPage((current) => current)}
              />
            ) : (
              <>
                <ProductGrid products={products} />

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => changePage(page - 1)}
                      className="rounded-lg border border-zinc-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {Array.from(
                      { length: pagination.totalPages },
                      (_, index) => index + 1
                    ).map((number) => (
                      <button
                        key={number}
                        onClick={() => changePage(number)}
                        className={`h-10 min-w-10 rounded-lg px-3 text-sm ${
                          page === number
                            ? "bg-indigo-600 text-white"
                            : "border border-zinc-200 text-zinc-700 hover:border-indigo-500"
                        }`}
                      >
                        {number}
                      </button>
                    ))}

                    <button
                      disabled={page >= pagination.totalPages}
                      onClick={() => changePage(page + 1)}
                      className="rounded-lg border border-zinc-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}