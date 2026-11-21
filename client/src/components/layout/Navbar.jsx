import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeftRight,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";

import NotificationBell from "../notifications/NotificationBell";
import useAuth from "../../hooks/useAuth";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useProductComparison } from "../../context/ProductComparisonContext";
import { useNotifications } from "../../context/NotificationContext";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Shop all", path: "/products" },
  { label: "Categories", path: "/categories" },
  { label: "Flash sales", path: "/flash-sales" },
];

const navLinkClass = ({ isActive }) =>
  `relative py-3 text-sm font-medium transition ${
    isActive
      ? "text-indigo-700 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-indigo-700"
      : "text-zinc-600 hover:text-indigo-700"
  }`;

function SearchBox({ value, onChange, onSubmit, mobile = false }) {
  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={`flex items-center rounded-full border border-line bg-[#f7f8f5] transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 ${
        mobile ? "h-11 w-full px-3" : "h-12 w-full max-w-[33rem] px-4"
      }`}
    >
      <Search size={18} className="shrink-0 text-muted" aria-hidden="true" />
      <label className="sr-only" htmlFor={mobile ? "mobile-store-search" : "store-search"}>
        Search products
      </label>
      <input
        id={mobile ? "mobile-store-search" : "store-search"}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search products, brands, or SKU"
        className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-muted/80"
      />
      <button
        type="submit"
        aria-label="Submit product search"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-indigo-50 hover:text-indigo-700"
      >
        <Search size={17} />
      </button>
    </form>
  );
}

function IconLink({ to, label, count, children }) {
  return (
    <Link
      to={to}
      aria-label={count ? `${label}, ${count} items` : label}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-zinc-700 transition hover:bg-[#f1f3ee] hover:text-indigo-700"
    >
      {children}
      {count > 0 && (
        <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-indigo-700 px-1 text-[10px] font-bold text-white ring-2 ring-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { count: comparisonCount } = useProductComparison();
  const { unreadCount } = useNotifications();

  const roleValue =
    typeof user?.role === "string"
      ? user.role
      : user?.role?.name || user?.role_name || "";
  const isAdmin = String(roleValue).toLowerCase() === "admin";

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/products?q=${encodeURIComponent(value)}` : "/products");
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 shadow-[0_3px_16px_rgba(29,40,34,0.04)] backdrop-blur-xl">
      <div className="bg-[#1d3026] text-white">
        <div className="container-custom flex min-h-8 items-center justify-center gap-2 text-center text-[11px] font-medium tracking-wide sm:text-xs">
          <ShoppingBag size={13} className="text-[#c7d7bd]" aria-hidden="true" />
          <span>Thoughtful finds, delivered with care</span>
          <span className="hidden text-white/40 sm:inline">·</span>
          <Link to="/products" className="hidden underline decoration-white/40 underline-offset-2 transition hover:decoration-white sm:inline">
            Explore the collection
          </Link>
        </div>
      </div>

      <div className="container-custom">
        <div className="flex min-h-[72px] items-center justify-between gap-3 md:gap-6">
          <Link
            to="/"
            aria-label="ShopSphere home"
            className="flex shrink-0 items-center gap-2.5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-indigo-700 text-white shadow-sm">
              <ShoppingBag size={19} strokeWidth={1.8} />
            </span>
            <span className="text-[19px] font-semibold tracking-tight text-ink sm:text-xl">
              ShopSphere
            </span>
          </Link>

          <div className="hidden flex-1 justify-center md:flex">
            <SearchBox value={query} onChange={setQuery} onSubmit={handleSearch} />
          </div>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <span className="hidden lg:block">
              {isAuthenticated && <NotificationBell />}
            </span>
            <span className="hidden sm:block">
              <IconLink to="/compare" label="Compare products" count={comparisonCount}>
                <ArrowLeftRight size={19} />
              </IconLink>
            </span>
            <span className="hidden sm:block">
              <IconLink to="/wishlist" label="Wishlist" count={wishlist.total_items}>
                <Heart size={19} />
              </IconLink>
            </span>
            <IconLink to="/cart" label="Shopping cart" count={cart.total_items}>
              <ShoppingCart size={19} />
            </IconLink>

            {isAuthenticated ? (
              <div className="relative hidden items-center gap-1 pl-1 lg:flex">
                {isAdmin ? (
                  <Link
                    to="/admin"
                    aria-label="Admin dashboard"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 transition hover:bg-[#f1f3ee]"
                  >
                    <LayoutDashboard size={18} />
                  </Link>
                ) : null}
                <Link
                  to="/account"
                  className="inline-flex max-w-36 items-center gap-1.5 rounded-full py-2 pl-2 pr-1 text-sm font-medium text-zinc-700 transition hover:bg-[#f1f3ee]"
                >
                  <UserRound size={18} />
                  <span className="max-w-24 truncate">{user?.name || user?.first_name || "Account"}</span>
                  <ChevronDown size={14} className="text-muted" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-1 hidden rounded-full bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800 lg:inline-flex"
              >
                Sign in
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              className="ml-1 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition hover:bg-[#f1f3ee] md:hidden"
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        <div className="pb-3 md:hidden">
          <SearchBox mobile value={query} onChange={setQuery} onSubmit={handleSearch} />
        </div>

        <nav aria-label="Main navigation" className="hidden border-t border-[#eef0eb] md:block">
          <div className="flex items-center gap-8">
            {navLinks.map((item) => (
              <NavLink key={item.path} to={item.path} end={item.path === "/"} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
            <Link to="/orders" className="ml-auto py-3 text-sm font-medium text-zinc-600 transition hover:text-indigo-700">
              Track an order
            </Link>
          </div>
        </nav>

        {menuOpen && (
          <nav aria-label="Mobile navigation" className="border-t border-line py-3 md:hidden">
            <div className="flex flex-col">
              {navLinks.map((item) => (
                <NavLink key={item.path} to={item.path} end={item.path === "/"} className={({ isActive }) =>
                  `rounded-xl px-3 py-3 text-sm font-medium ${isActive ? "bg-indigo-50 text-indigo-800" : "text-zinc-700 hover:bg-[#f6f7f3]"}`
                }>
                  {item.label}
                </NavLink>
              ))}
              <Link to="/compare" className="rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-[#f6f7f3]">
                Compare products{comparisonCount > 0 ? ` (${comparisonCount})` : ""}
              </Link>
              <Link to="/wishlist" className="rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-[#f6f7f3]">
                Wishlist{wishlist.total_items > 0 ? ` (${wishlist.total_items})` : ""}
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/account" className="rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-[#f6f7f3]">My account</Link>
                  <Link to="/orders" className="rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-[#f6f7f3]">My orders</Link>
                  <Link to="/account/notifications" className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-[#f6f7f3]">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-indigo-700 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                  {isAdmin && <Link to="/admin" className="rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-[#f6f7f3]">Admin dashboard</Link>}
                  <button type="button" onClick={handleLogout} className="rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50">Sign out</button>
                </>
              ) : (
                <Link to="/login" className="mt-2 rounded-xl bg-indigo-700 px-4 py-3 text-center text-sm font-semibold text-white">Sign in</Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
