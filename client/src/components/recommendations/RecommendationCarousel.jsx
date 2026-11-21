import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import ProductCard from "../products/ProductCard";
import SectionHeading from "../common/SectionHeading";

export default function RecommendationCarousel({
  title,
  description,
  products = [],
  loading = false,
  error = "",
  onRetry,
}) {
  const railRef = useRef(null);

  if (!loading && !error && !products.length) return null;

  const scroll = (direction) => {
    railRef.current?.scrollBy({
      left: direction * 360,
      behavior: "smooth",
    });
  };

  return (
    <section className="container-custom py-10 sm:py-12">
      <SectionHeading
        eyebrow="ShopSphere picks"
        title={title}
        description={description}
        link="/products"
        linkText="View all"
      />

      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>
          {onRetry && (
            <button type="button" onClick={onRetry} className="font-semibold underline">
              Retry
            </button>
          )}
        </div>
      ) : loading ? (
        <div
          role="status"
          aria-label={`Loading ${title}`}
          className="flex gap-4 overflow-hidden"
        >
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="w-64 shrink-0 animate-pulse overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 sm:w-72"
            >
              <div className="aspect-square rounded-xl bg-zinc-100" />
              <div className="mt-4 h-3 w-1/3 rounded bg-zinc-100" />
              <div className="mt-3 h-4 w-4/5 rounded bg-zinc-100" />
              <div className="mt-2 h-4 w-2/3 rounded bg-zinc-100" />
              <div className="mt-5 h-8 w-1/2 rounded bg-zinc-100" />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          <div
            ref={railRef}
            role="region"
            aria-label={`${title} products`}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3"
          >
            {products.map((product) => (
              <div
                key={product.product_id}
                className="w-64 shrink-0 snap-start sm:w-72"
              >
                <ProductCard product={product} showRating={false} />
              </div>
            ))}
          </div>
          {products.length > 2 && (
            <div className="absolute -top-[4.25rem] right-0 hidden gap-2 sm:flex">
              <button
                type="button"
                aria-label={`Scroll ${title} left`}
                onClick={() => scroll(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm hover:border-indigo-300 hover:text-indigo-700"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                type="button"
                aria-label={`Scroll ${title} right`}
                onClick={() => scroll(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm hover:border-indigo-300 hover:text-indigo-700"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
