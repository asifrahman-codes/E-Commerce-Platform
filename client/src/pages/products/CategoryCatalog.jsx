import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Layers3 } from "lucide-react";

import categoryService from "../../services/category.service";
import ErrorMessage from "../../components/common/ErrorMessage";
import { getImageUrl, getResponsiveImageProps } from "../../utils/product.utils";

export default function CategoryCatalog() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await categoryService.getCategories();
      setCategories(
        result.filter(
          (category) =>
            String(category.status ?? "ACTIVE").toUpperCase() === "ACTIVE"
        )
      );
    } catch (loadError) {
      setError(loadError?.message || "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  return (
    <div className="premium-page">
      <div className="container-custom py-10 sm:py-14">
        <header className="mb-9 max-w-2xl">
          <p className="shop-eyebrow">Explore ShopSphere</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Browse by category
          </h1>
          <p className="mt-3 text-base leading-7 text-muted">
            Find your way to something useful, lovely, or a little unexpected.
          </p>
        </header>

        {loading ? (
          <div role="status" aria-label="Loading categories" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="animate-pulse overflow-hidden rounded-[1.4rem] border border-line bg-white p-3">
                <div className="aspect-[5/4] rounded-xl bg-[#edf0e9]" />
                <div className="mt-4 h-4 w-2/3 rounded bg-[#edf0e9]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="shop-panel p-6 sm:p-8">
            <ErrorMessage message={error} onRetry={loadCategories} />
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#cdd8cf] bg-white px-6 py-16 text-center">
            <Layers3 size={34} strokeWidth={1.4} className="mx-auto text-[#8fa393]" />
            <h2 className="mt-4 text-lg font-semibold text-ink">No categories to show yet</h2>
            <p className="mt-2 text-sm text-muted">Check back soon as the collection grows.</p>
            <Link to="/products" className="shop-button shop-button-primary mt-6">
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {categories.map((category, index) => {
              const id = category.category_id ?? category.id;
              const name = category.name ?? category.category_name ?? "Category";
              const image = getImageUrl(category.image_url ?? category.image);

              return (
                <Link
                  key={id ?? index}
                  to={`/products?category_id=${encodeURIComponent(id)}`}
                  className="group overflow-hidden rounded-[1.4rem] border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(27,60,46,0.10)]"
                >
                  <div className="relative flex aspect-[5/4] items-center justify-center overflow-hidden bg-[#f0f3ed]">
                    {image ? (
                      <img
                        {...getResponsiveImageProps(image, {
                          sizes: "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
                        })}
                        alt={name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <Layers3 size={42} strokeWidth={1.2} className="text-[#96a797]" />
                    )}
                    <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-indigo-700 shadow-sm transition group-hover:translate-x-0.5">
                      <ArrowUpRight size={17} />
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <h2 className="font-medium text-ink transition group-hover:text-indigo-700">{name}</h2>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#e9ede5] px-5 py-5 sm:px-7">
            <div>
              <h2 className="font-semibold text-ink">Looking for something specific?</h2>
              <p className="mt-1 text-sm text-muted">Search the complete ShopSphere collection.</p>
            </div>
            <Link to="/products" className="shop-button shop-button-secondary">
              Explore all products
              <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
