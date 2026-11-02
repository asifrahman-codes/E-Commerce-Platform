import { Link, NavLink } from "react-router-dom";
import {
  ShoppingBag,
  Search,
  Heart,
  ShoppingCart,
  UserRound,
  Menu,
} from "lucide-react";

const Navbar = () => {
  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? "text-indigo-600"
        : "text-gray-600 hover:text-indigo-600"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
      <div className="container-custom">
        <div className="flex h-20 items-center justify-between gap-6">

          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag size={28} className="text-indigo-600" />

            <span className="text-xl font-bold tracking-tight">
              Shop<span className="text-indigo-600">Sphere</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>

            <NavLink to="/products" className={navLinkClass}>
              Products
            </NavLink>

            <NavLink to="/categories" className={navLinkClass}>
              Categories
            </NavLink>
          </nav>

          <div className="flex items-center gap-4">

            <button
              className="hidden text-gray-600 hover:text-indigo-600 sm:block"
              aria-label="Search"
            >
              <Search size={21} />
            </button>

            <Link
              to="/wishlist"
              className="hidden text-gray-600 hover:text-indigo-600 sm:block"
              aria-label="Wishlist"
            >
              <Heart size={21} />
            </Link>

            <Link
              to="/cart"
              className="text-gray-600 hover:text-indigo-600"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={22} />
            </Link>

            <Link
              to="/login"
              className="hidden text-gray-600 hover:text-indigo-600 sm:block"
              aria-label="Login"
            >
              <UserRound size={21} />
            </Link>

            <button
              className="text-gray-600 md:hidden"
              aria-label="Open menu"
            >
              <Menu size={23} />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;