import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-gray-950 text-gray-300">
      <div className="container-custom py-12">

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          <div>
            <div className="mb-4 flex items-center gap-2 text-white">
              <ShoppingBag size={25} className="text-indigo-400" />

              <span className="text-xl font-bold">
                ShopSphere
              </span>
            </div>

            <p className="max-w-xs text-sm leading-6 text-gray-400">
              Your destination for quality products and a seamless
              online shopping experience.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3 text-sm">
              <Link to="/">Home</Link>
              <Link to="/products">Products</Link>
              <Link to="/categories">Categories</Link>
              <Link to="/cart">Shopping Cart</Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">
              Customer Service
            </h3>

            <div className="flex flex-col gap-3 text-sm">
              <Link to="/account">My Account</Link>
              <Link to="/orders">My Orders</Link>
              <Link to="/wishlist">Wishlist</Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">
              Contact
            </h3>

            <p className="text-sm leading-6 text-gray-400">
              We're here to help you with your shopping experience.
            </p>
          </div>

        </div>

        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ShopSphere. All rights reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;