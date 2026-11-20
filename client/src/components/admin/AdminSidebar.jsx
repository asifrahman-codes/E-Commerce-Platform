import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  ShoppingBag,
  Star,
  Package,
  Warehouse,
  ArrowDownUp,
  History,
  AlertTriangle,
} from "lucide-react";

const sections = [
  {
    title: "Overview",
    links: [
      { label: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
      { label: "Orders", path: "/admin/orders", icon: ShoppingBag },
      { label: "Reviews", path: "/admin/reviews", icon: Star },
    ],
  },
  {
    title: "Catalog",
    links: [
      { label: "Products", path: "/admin/products", icon: Package },
    ],
  },
  {
    title: "Inventory",
    links: [
      { label: "Inventory", path: "/admin/inventory", icon: Warehouse, end: true },
      { label: "Stock Adjustment", path: "/admin/inventory/adjust", icon: ArrowDownUp },
      { label: "Inventory History", path: "/admin/inventory/history", icon: History },
      { label: "Low Stock", path: "/admin/inventory/low-stock", icon: AlertTriangle },
    ],
  },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-indigo-50 text-indigo-700"
      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
  }`;

export default function AdminSidebar() {
  return (
    <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:self-start">
      <h2 className="mb-4 hidden px-3 text-lg font-semibold text-zinc-900 lg:block">
        Admin Panel
      </h2>

      {/* Mobile: one scrollable row. Desktop: grouped vertical list. */}
      <nav className="flex gap-2 overflow-x-auto lg:block lg:space-y-5 lg:overflow-visible">
        {sections.map((section) => (
          <div key={section.title} className="flex gap-2 lg:block lg:space-y-1">
            <p className="hidden px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400 lg:block">
              {section.title}
            </p>

            {section.links.map(({ label, path, icon: Icon, end }) => (
              <NavLink key={path} to={path} end={end} className={linkClass}>
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}