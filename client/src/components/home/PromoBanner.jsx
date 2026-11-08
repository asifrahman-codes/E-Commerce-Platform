import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const PromoBanner = () => {
  return (
    <section className="container-custom py-8">

      <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-7 py-14 sm:px-12 lg:px-16">

        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />

        <div className="relative max-w-2xl">

          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-indigo-200">
            <Sparkles size={16} />
            Explore ShopSphere
          </div>

          <h2 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-4xl">
            Find Products That
            <span className="block text-indigo-300">
              Match Your Lifestyle.
            </span>
          </h2>

          <p className="mt-4 max-w-lg text-sm leading-7 text-gray-300">
            Discover our growing product collection and find something worth adding to your shopping cart.
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white transition hover:bg-indigo-500"
          >
            Explore Collection
            <ArrowRight size={18} />
          </Link>

        </div>

      </div>

    </section>
  );
};

export default PromoBanner;