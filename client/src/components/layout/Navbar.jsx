import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  ShoppingBag,
  Search,
  Heart,
  ShoppingCart,
  UserRound,
  LogOut,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? "text-indigo-600"
        : "text-gray-600 hover:text-indigo-600"
    }`;

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">

      <div className="container-custom">

        <div className="flex h-20 items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">

            <ShoppingBag size={28} className="text-indigo-600" />

            <span className="text-xl font-bold">
              Shop<span className="text-indigo-600">Sphere</span>
            </span>

          </Link>

          {/* Navigation */}
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

          {/* Actions */}
          <div className="flex items-center gap-4">

            <button
              className="hidden text-gray-600 hover:text-indigo-600 sm:block"
              aria-label="Search"
            >
              <Search size={21} />
            </button>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="hidden text-gray-600 hover:text-indigo-600 sm:block"
            >
              <Heart size={21} />
            </Link>

            <Link
              to="/cart"
              aria-label="Shopping Cart"
              className="text-gray-600 hover:text-indigo-600"
            >
              <ShoppingCart size={22} />
            </Link>

            {isAuthenticated ? (

              <div className="flex items-center gap-3">

                <Link
                  to="/account"
                  className="hidden items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 sm:flex"
                >
                  <UserRound size={19} />
                  {user?.name || "My Account"}
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut size={20} />
                </button>

              </div>

            ) : (

              <Link
                to="/login"
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Sign In
              </Link>

            )}

          </div>

        </div>

      </div>

    </header>
  );
};

export default Navbar;