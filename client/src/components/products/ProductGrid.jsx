import ProductCard from "./ProductCard";

const ProductGrid = ({
  products = [],
  view = "grid",
  loading = false,
  emptyMessage = "No products are available right now.",
}) => {
  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading products"
        className={view === "list" ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"}
      >
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="animate-pulse overflow-hidden rounded-[1.35rem] border border-line bg-white p-3 sm:p-4">
            <div className="aspect-[4/5] rounded-xl bg-[#edf0e9]" />
            <div className="mt-4 h-3 w-1/3 rounded bg-[#edf0e9]" />
            <div className="mt-3 h-4 w-4/5 rounded bg-[#edf0e9]" />
            <div className="mt-2 h-4 w-2/3 rounded bg-[#edf0e9]" />
            <div className="mt-5 h-8 w-1/2 rounded bg-[#edf0e9]" />
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-3xl border border-dashed border-[#cdd8cf] bg-white px-6 py-16 text-center">
        <p className="font-medium text-ink">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={view === "list" ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"}>
      {products.map((product, index) => (
        <ProductCard
          key={
            product.product_id ??
            product.id ??
            product.productId ??
            index
          }
          product={product}
          view={view}
        />
      ))}
    </div>
  );
};

export default ProductGrid;