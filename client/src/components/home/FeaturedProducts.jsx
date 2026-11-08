import { useCallback, useEffect, useState } from "react";

import { getFeaturedProducts } from "../../services/product.service";

import SectionHeading from "../common/SectionHeading";
import ProductGrid from "../products/ProductGrid";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getFeaturedProducts();

      setProducts(result);

    } catch (error) {
      setError(error.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <section className="bg-gray-50 py-16">

      <div className="container-custom">

        <SectionHeading
          eyebrow="Our Collection"
          title="Featured Products"
          description="Explore products available in our store."
          link="/products"
        />

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage
            message={error}
            onRetry={fetchProducts}
          />
        ) : (
          <ProductGrid products={products} />
        )}

      </div>

    </section>
  );
};

export default FeaturedProducts;