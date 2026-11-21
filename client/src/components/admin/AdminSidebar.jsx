import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  BadgePercent,
  BarChart3,
  Boxes,
  CreditCard,
  FolderTree,
  Gift,
  Headset,
  History,
  LayoutDashboard,
  MessageSquareText,
  Package,
  ShoppingBag,
  Star,
  Tags,
  Truck,
  Users,
  Warehouse,
  ArrowDownUp,
  AlertTriangle,
  Bell,
  Settings,
  X,
} from "lucide-react";

const sections = [
  {
    title: "Workspace",
    links: [
      { label: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
      { label: "Reports", path: "/admin/reports", icon: BarChart3 },
      { label: "Customers", path: "/admin/customers", icon: Users },
    ],
  },
  {
    title: "Sales",
    links: [
      { label: "Orders", path: "/admin/orders", icon: ShoppingBag },
      { label: "Payments", path: "/admin/payments", icon: CreditCard },
      { label: "Shipments", path: "/admin/shipments", icon: Truck },
      { label: "Shipping methods", path: "/admin/shipping-methods", icon: Truck },
      { label: "Coupons", path: "/admin/coupons", icon: BadgePercent },
    ],
  },
  {
    title: "Catalog",
    links: [
      { label: "Products", path: "/admin/products", icon: Package },
      { label: "Categories", path: "/admin/categories", icon: FolderTree },
      { label: "Brands", path: "/admin/brands", icon: Tags },
    ],
  },
  {
    title: "Operations",
    links: [
      { label: "Inventory", path: "/admin/inventory", icon: Warehouse, end: true },
      { label: "Stock adjustment", path: "/admin/inventory/adjust", icon: ArrowDownUp },
      { label: "Transactions", path: "/admin/inventory/history", icon: History },
      { label: "Low stock", path: "/admin/inventory/low-stock", icon: AlertTriangle },
    ],
  },
  {
    title: "Engagement",
    links: [
      { label: "Notifications", path: "/admin/notifications", icon: Bell },
      { label: "Reviews", path: "/admin/reviews", icon: Star },
      { label: "Product Q&A", path: "/admin/product-questions", icon: MessageSquareText },
      { label: "Support tickets", path: "/admin/support", icon: Headset },
      { label: "Rewards & sales", path: "/admin/rewards-sales", icon: Gift },
      { label: "Settings", path: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminSidebar({ open = false, onNavigate }) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onNavigate?.();
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onNavigate]);

  return (
    <aside
      role={open ? "dialog" : undefined}
      aria-label={open ? "Admin navigation" : undefined}
      aria-modal={open ? "true" : undefined}
      className={`fixed inset-y-0 left-0 z-50 flex w-[268px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
        open ? "visible translate-x-0" : "invisible -translate-x-full lg:visible lg:translate-x-0"
      }`}
    >
      <div className="flex h-[76px] shrink-0 items-center gap-3 border-b border-slate-100 px-4 lg:px-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#244b39] text-white shadow-sm">
          <Boxes size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold tracking-tight text-slate-900">ShopSphere</p>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Admin workspace</p>
        </div>
        {open && (
          <button type="button" onClick={onNavigate} aria-label="Close admin navigation" className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden">
            <X size={19} />
          </button>
        )}
      </div>

      <nav aria-label="Admin navigation" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.links.map(({ label, path, icon: Icon, end }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${
                      isActive
                        ? "bg-[#eaf1ec] text-[#244b39]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={17} className="shrink-0 opacity-80" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-xl bg-slate-50 px-3 py-3">
          <p className="text-xs font-semibold text-slate-700">ShopSphere Admin</p>
          <p className="mt-1 text-[11px] text-slate-500">Store operations workspace</p>
        </div>
      </div>
    </aside>
  );
}
