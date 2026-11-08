import { useState } from "react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  ShoppingBag,
  Search,
  Heart,
  ShoppingCart,
  UserRound,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Categories", path: "/categories" },
  ];

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive
        ? "text-indigo-600"
        : "text-gray-600 hover:text-indigo-600"
    }`;

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">

      <div className="container-custom">

        <div className="flex h-20 items-center justify-between gap-4">

          {/* Logo */}
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="flex shrink-0 items-center gap-2"
          >
            <ShoppingBag size={27} className="text-indigo-600" />

            <span className="text-xl font-bold text-gray-900">
              Shop<span className="text-indigo-600">Sphere</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-8 md:flex">

            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}

          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">

            <Link
              to="/products"
              aria-label="Search products"
              className="hidden text-gray-600 hover:text-indigo-600 sm:block"
            >
              <Search size={21} />
            </Link>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="hidden text-gray-600 hover:text-indigo-600 sm:block"
            >
              <Heart size={21} />
            </Link>

            <Link
              to="/cart"
              aria-label="Shopping cart"
              className="text-gray-600 hover:text-indigo-600"
            >
              <ShoppingCart size={21} />
            </Link>

            {isAuthenticated ? (

              <div className="hidden items-center gap-3 lg:flex">

                <Link
                  to="/account"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  <UserRound size={19} />
                  {user?.name || user?.first_name || "Account"}
                </Link>

                <button
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="text-gray-500 hover:text-red-600"
                >
                  <LogOut size={19} />
                </button>

              </div>

            ) : (

              <Link
                to="/login"
                className="hidden rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 lg:block"
              >
                Sign In
              </Link>

            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
            >
              {menuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>

          </div>

        </div>

        {/* Mobile navigation */}
        {menuOpen && (

          <nav className="border-t border-gray-100 py-5 md:hidden">

            <div className="flex flex-col gap-5">

              {navLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={navLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}

              {isAuthenticated ? (

                <>
                  <Link
                    to="/account"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-medium text-gray-600"
                  >
                    My Account
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-left text-sm font-medium text-red-600"
                  >
                    Logout
                  </button>
                </>

              ) : (

                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-semibold text-indigo-600"
                >
                  Sign In
                </Link>

              )}

            </div>

          </nav>

        )}

      </div>

    </header>
  );
};

export default Navbar;