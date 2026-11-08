import { useCallback, useEffect, useState } from "react";

import { getNewArrivals } from "../../services/product.service";

import SectionHeading from "../common/SectionHeading";
import ProductGrid from "../products/ProductGrid";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";

const NewArrivals = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getNewArrivals();

      setProducts(result);

    } catch (error) {
      setError(error.message || "Unable to load new arrivals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <section className="container-custom py-16">

      <SectionHeading
        eyebrow="Just Arrived"
        title="New Arrivals"
        description="Discover recently added products."
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

    </section>
  );
};

export default NewArrivals;