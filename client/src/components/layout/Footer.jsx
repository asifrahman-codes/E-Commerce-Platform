import { Link } from "react-router-dom";

import {
  ShoppingBag,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-300">

      <div className="container-custom grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-4">

        {/* Brand */}
        <div>

          <Link to="/" className="flex items-center gap-2">

            <ShoppingBag size={27} className="text-indigo-400" />

            <span className="text-xl font-bold text-white">
              Shop<span className="text-indigo-400">Sphere</span>
            </span>

          </Link>

          <p className="mt-5 max-w-xs text-sm leading-7 text-gray-400">
            Discover products and enjoy a convenient online shopping experience with ShopSphere.
          </p>

          <div className="mt-6 flex gap-3">

            {[Facebook, Instagram, Twitter].map((Icon, index) => (
              <a
                key={index}
                href="#"
                aria-label={`Social media ${index + 1}`}
                onClick={(event) => event.preventDefault()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition hover:bg-indigo-600"
              >
                <Icon size={18} />
              </a>
            ))}

          </div>

        </div>

        {/* Shopping */}
        <div>

          <h3 className="font-semibold text-white">
            Shopping
          </h3>

          <ul className="mt-5 space-y-3 text-sm">

            <li><Link to="/products" className="hover:text-white">All Products</Link></li>

            <li><Link to="/categories" className="hover:text-white">Categories</Link></li>

            <li><Link to="/cart" className="hover:text-white">Shopping Cart</Link></li>

            <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>

          </ul>

        </div>

        {/* Account */}
        <div>

          <h3 className="font-semibold text-white">
            My Account
          </h3>

          <ul className="mt-5 space-y-3 text-sm">

            <li><Link to="/account" className="hover:text-white">My Profile</Link></li>

            <li><Link to="/orders" className="hover:text-white">My Orders</Link></li>

            <li><Link to="/login" className="hover:text-white">Login</Link></li>

            <li><Link to="/register" className="hover:text-white">Register</Link></li>

          </ul>

        </div>

        {/* Contact */}
        <div>

          <h3 className="font-semibold text-white">
            Contact
          </h3>

          <ul className="mt-5 space-y-4 text-sm">

            <li className="flex items-center gap-3">
              <Mail size={17} className="text-indigo-400" />
              Customer support
            </li>

            <li className="flex items-center gap-3">
              <Phone size={17} className="text-indigo-400" />
              Contact information coming soon
            </li>

            <li className="flex items-center gap-3">
              <MapPin size={17} className="text-indigo-400" />
              Online Store
            </li>

          </ul>

        </div>

      </div>

      <div className="border-t border-gray-800">

        <div className="container-custom flex flex-col items-center justify-between gap-3 py-6 text-xs text-gray-500 sm:flex-row">

          <p>
            © {new Date().getFullYear()} ShopSphere. All rights reserved.
          </p>

          <p>
            Built with React, Node.js and MySQL.
          </p>

        </div>

      </div>

    </footer>
  );
};

export default Footer;