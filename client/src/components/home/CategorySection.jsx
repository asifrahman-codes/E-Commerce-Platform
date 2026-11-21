
import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { ArrowRight, Layers3 } from "lucide-react";

import categoryService from "../../services/category.service";

import SectionHeading from "../common/SectionHeading";
import ErrorMessage from "../common/ErrorMessage";
import { getResponsiveImageProps } from "../../utils/product.utils";

const CategorySection = () => {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await categoryService.getCategories();

      setCategories(
        result
          .filter((category) => String(category.status ?? "ACTIVE").toUpperCase() === "ACTIVE")
          .slice(0, 8)
      );

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
    <section className="container-custom py-14 sm:py-16">

      <SectionHeading
        eyebrow="Browse Collection"
        title="Shop by Category"
        description="Explore our available product categories."
        link="/categories"
      />

      {loading ? (
        <div role="status" aria-label="Loading featured categories" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="animate-pulse overflow-hidden rounded-[1.4rem] border border-line bg-white p-3">
              <div className="aspect-[5/4] rounded-xl bg-[#edf0e9]" />
              <div className="mt-4 h-4 w-2/3 rounded bg-[#edf0e9]" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorMessage
          message={error}
          onRetry={fetchCategories}
        />
      ) : categories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white py-12 text-center text-muted">
          Categories will appear here when available.
        </div>
      ) : (

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">

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
                className="group overflow-hidden rounded-[1.4rem] border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(27,60,46,0.10)]"
              >

                <div className="flex aspect-[5/4] items-center justify-center overflow-hidden bg-[#f0f3ed]">

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
                    <Layers3
                      size={45}
                      className="text-indigo-400"
                    />
                  )}

                </div>

                <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4">

                  <h3 className="font-medium text-ink transition group-hover:text-indigo-700">
                    {name}
                  </h3>

                  <ArrowRight
                    size={17}
                    className="text-muted transition group-hover:translate-x-1 group-hover:text-indigo-700"
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
