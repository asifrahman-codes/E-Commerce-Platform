import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";

const Home = () => {
  return (
    <section className="bg-gray-50">
      <div className="container-custom flex min-h-[550px] flex-col items-center justify-center py-20 text-center">

        <div className="mb-6 flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
          <ShoppingBag size={17} />
          Welcome to ShopSphere
        </div>

        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Discover Products.
          <span className="block text-indigo-600">
            Enjoy Shopping.
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-gray-500 sm:text-lg">
          Explore a collection of quality products with a simple,
          convenient and secure shopping experience.
        </p>

        <Link
          to="/products"
          className="mt-9 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 font-semibold text-white transition hover:bg-indigo-700"
        >
          Explore Products
          <ArrowRight size={19} />
        </Link>

      </div>
    </section>
  );
};

export default Home;