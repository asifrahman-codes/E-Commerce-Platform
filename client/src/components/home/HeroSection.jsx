import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="overflow-hidden bg-indigo-50">

      <div className="container-custom grid min-h-[520px] items-center gap-10 py-16 lg:grid-cols-2">

        <div>

          <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm">
            Welcome to ShopSphere
          </span>

          <h1 className="mt-6 max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">

            Discover Products.
            <span className="block text-indigo-600">
              Enjoy Shopping.
            </span>

          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-gray-600">
            Explore a collection of quality products and enjoy a convenient shopping experience with ShopSphere.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 font-semibold text-white transition hover:bg-indigo-700"
            >
              Shop Now
              <ArrowRight size={19} />
            </Link>

            <Link
              to="/categories"
              className="rounded-xl border border-gray-300 bg-white px-7 py-3.5 font-semibold text-gray-700 transition hover:border-indigo-500 hover:text-indigo-600"
            >
              Explore Categories
            </Link>

          </div>

          <div className="mt-10 flex flex-wrap gap-6">

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck size={20} className="text-indigo-600" />
              Convenient Delivery
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShieldCheck size={20} className="text-indigo-600" />
              Secure Shopping
            </div>

          </div>

        </div>

        <div className="relative hidden lg:block">

          <div className="absolute -right-10 -top-10 h-80 w-80 rounded-full bg-indigo-200/60 blur-3xl" />

          <div className="relative flex min-h-[400px] items-center justify-center rounded-3xl bg-white p-8 shadow-sm">

            <div className="text-center">

              <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-indigo-50">
                <ShoppingBagIllustration />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Your Shopping Destination
              </h2>

              <p className="mt-2 text-gray-500">
                Discover something you'll love.
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

const ShoppingBagIllustration = () => {
  return (
    <svg
      viewBox="0 0 120 120"
      className="h-24 w-24 text-indigo-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M25 42h70l-5 62H30l-5-62Z" />
      <path d="M42 42V32a18 18 0 0 1 36 0v10" />
      <path d="M44 62v5m32-5v5" />
    </svg>
  );
};

export default HeroSection;