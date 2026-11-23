import { useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronRight, LogOut, Menu, Search, ShoppingBag, X } from "lucide-react";

import AdminSidebar from "../../components/admin/AdminSidebar";
import { AdminToastProvider } from "../../components/admin/AdminToastContext";
import useAuth from "../../hooks/useAuth";
import { useNotifications } from "../../context/NotificationContext";

const pageNames = {
  "/admin": "Dashboard",
  "/admin/orders": "Orders",
  "/admin/payments": "Payments",
  "/admin/reports": "Reports",
  "/admin/customers": "Customers",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/brands": "Brands",
  "/admin/coupons": "Coupons",
  "/admin/shipping-methods": "Shipping methods",
  "/admin/notifications": "Notifications",
  "/admin/settings": "Settings & promotions",
  "/admin/inventory": "Inventory",
  "/admin/inventory/adjust": "Stock adjustment",
  "/admin/inventory/history": "Inventory transactions",
  "/admin/inventory/low-stock": "Low stock",
  "/admin/reviews": "Reviews",
  "/admin/product-questions": "Product Q&A",
  "/admin/support": "Support tickets",
  "/admin/rewards-sales": "Rewards & flash sales",
  "/admin/ai-assistant": "AI Assistant",
};

const quickLinks = Object.entries(pageNames).map(([path, label]) => ({
  path,
  label,
}));

function getBreadcrumbs(pathname) {
  const exact = pageNames[pathname];
  if (pathname === "/admin") return [{ label: "Dashboard" }];
  if (exact) return [{ label: "Dashboard", path: "/admin" }, { label: exact }];

  if (pathname.startsWith("/admin/orders/")) {
    return [
      { label: "Dashboard", path: "/admin" },
      { label: "Orders", path: "/admin/orders" },
      { label: "Order details" },
    ];
  }

  if (pathname.startsWith("/admin/products/")) {
    const productPage = pathname.endsWith("/variants")
      ? "Product variants"
      : pathname.endsWith("/create")
        ? "Create product"
        : "Edit product";
    return [
      { label: "Dashboard", path: "/admin" },
      { label: "Products", path: "/admin/products" },
      { label: productPage },
    ];
  }

  if (pathname.startsWith("/admin/support/")) {
    return [
      { label: "Dashboard", path: "/admin" },
      { label: "Support tickets", path: "/admin/support" },
      { label: "Ticket details" },
    ];
  }

  return [{ label: "Dashboard", path: "/admin" }, { label: "Admin" }];
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const filteredLinks = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? quickLinks.filter((item) => item.label.toLowerCase().includes(term))
      : [];
  }, [search]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const displayName = user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Administrator";

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-ink">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <AdminSidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className={`min-h-screen transition-[padding] duration-200 ${sidebarCollapsed ? "lg:pl-[82px]" : "lg:pl-[268px]"}`}>
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-[76px] items-center gap-4 px-4 sm:px-7">
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
              aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X size={19} /> : <Menu size={19} />}
            </button>

            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 sm:hidden">
              {breadcrumbs[breadcrumbs.length - 1]?.label}
            </p>

            <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
              {breadcrumbs.map((item, index) => (
                <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
                  {index > 0 && <ChevronRight size={14} className="shrink-0 text-slate-300" />}
                  {item.path ? (
                    <Link to={item.path} className="truncate text-slate-500 transition hover:text-[#315d47]">
                      {item.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="truncate font-semibold text-slate-900">
                      {item.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>

            <div className="relative ml-auto hidden min-w-0 max-w-sm flex-1 md:block">
              <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && filteredLinks[0]) {
                    navigate(filteredLinks[0].path);
                    setSearch("");
                    setSearchOpen(false);
                  }
                  if (event.key === "Escape") setSearchOpen(false);
                }}
                placeholder="Jump to a page…"
                aria-label="Find an admin page"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#759c84] focus:bg-white focus:ring-4 focus:ring-[#315d47]/10"
              />
              {searchOpen && filteredLinks.length > 0 && (
                <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  {filteredLinks.slice(0, 6).map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onMouseDown={() => setSearch("")}
                      className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-[#315d47]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/"
              aria-label="View storefront"
              title="View storefront"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:border-[#759c84] hover:bg-slate-50 hover:text-[#315d47]"
            >
              <ShoppingBag size={17} />
              <span className="hidden xl:inline">Storefront</span>
            </Link>

            <Link
              to="/admin/notifications"
              aria-label="Admin notifications"
              className="relative hidden h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#315d47] sm:inline-flex"
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />}
            </Link>

            <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
              <div className="hidden text-right xl:block">
                <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6efe9] text-sm font-bold text-[#315d47]">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                title="Sign out"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </header>

        <AdminToastProvider>
          <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-7 sm:py-8">
            <Outlet />
          </main>
        </AdminToastProvider>
      </div>
    </div>
  );
}
