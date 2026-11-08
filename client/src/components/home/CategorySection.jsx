import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { ArrowRight, Layers3 } from "lucide-react";

import { getCategories } from "../../services/category.service";

import SectionHeading from "../common/SectionHeading";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";

const CategorySection = () => {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getCategories();

      setCategories(result.slice(0, 8));

    } catch (error) {
      setError(error.message || "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <section className="container-custom py-16">

      <SectionHeading
        eyebrow="Browse Collection"
        title="Shop by Category"
        description="Explore our available product categories."
        link="/categories"
      />

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage
          message={error}
          onRetry={fetchCategories}
        />
      ) : categories.length === 0 ? (
        <div className="rounded-xl bg-gray-50 py-12 text-center text-gray-500">
          Categories will appear here when available.
        </div>
      ) : (

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

          {categories.map((category, index) => {

            const id =
              category.category_id ??
              category.id;

            const name =
              category.name ??
              category.category_name ??
              "Category";

            const image =
              category.image_url ??
              category.image ??
              "";

            return (
              <Link
                key={id ?? index}
                to={`/products?category_id=${id}`}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:-translate-y-1 hover:shadow-md"
              >

                <div className="flex aspect-[5/4] items-center justify-center overflow-hidden bg-indigo-50">

                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <Layers3
                      size={45}
                      className="text-indigo-400"
                    />
                  )}

                </div>

                <div className="flex items-center justify-between p-4">

                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                    {name}
                  </h3>

                  <ArrowRight
                    size={17}
                    className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-indigo-600"
                  />

                </div>

              </Link>
            );
          })}

        </div>

      )}

    </section>
  );
};

export default CategorySection;