import ProductCard from "./ProductCard";

const ProductGrid = ({ products = [] }) => {
  if (!products.length) {
    return (
      <div className="rounded-xl bg-gray-50 py-16 text-center">
        <p className="font-medium text-gray-700">
          No products available yet.
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={
            product.product_id ??
            product.id ??
            product.productId ??
            index
          }
          product={product}
        />
      ))}
    </div>
  );
};

export default ProductGrid;