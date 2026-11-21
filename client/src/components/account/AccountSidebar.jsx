import { NavLink, useLocation } from "react-router-dom";
import {
  User,
  MapPin,
  Lock,
  ShoppingBag,
  Heart,
  Star,
  Bell,
  Gift,
  Headset,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import useDialogFocus from "../../hooks/useDialogFocus";

const navItems = [
  { to: "/account", icon: User, label: "Profile", end: true },
  { to: "/account/addresses", icon: MapPin, label: "Addresses" },
  { to: "/account/password", icon: Lock, label: "Password" },
  { to: "/orders", icon: ShoppingBag, label: "Orders" },
  { to: "/wishlist", icon: Heart, label: "Wishlist" },
  { to: "/my-reviews", icon: Star, label: "Reviews" },
  { to: "/account/notifications", icon: Bell, label: "Notifications" },
  { to: "/account/loyalty", icon: Gift, label: "Loyalty points" },
  { to: "/support", icon: Headset, label: "Customer support" },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
    isActive
      ? "bg-indigo-50 text-indigo-700 shadow-sm"
      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
  }`;

export default function AccountSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dialogRef = useRef(null);
  const location = useLocation();

  const currentLabel =
    navItems.find(
      (item) =>
        item.end
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to)
    )?.label || "Account";

  useDialogFocus(dialogRef, mobileOpen, () => setMobileOpen(false));

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-expanded={mobileOpen}
        aria-controls="account-mobile-navigation"
        className="flex min-h-11 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm lg:hidden"
      >
        <span className="flex items-center gap-2">
          <Menu size={18} />
          {currentLabel}
        </span>
        <ChevronRight
          size={16}
          className={`transition-transform ${mobileOpen ? "rotate-90" : ""}`}
        />
      </button>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Account navigation"
          tabIndex={-1}
          ref={dialogRef}
          className="fixed inset-0 z-50 lg:hidden"
        >
          <button
            type="button"
            aria-label="Close account navigation"
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />

          <nav id="account-mobile-navigation" aria-label="Account navigation" className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900">My Account</h3>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close account navigation"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `min-h-11 ${linkClass({ isActive })}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <nav aria-label="Account navigation" className="shop-panel hidden p-3 lg:block">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
            >
              <item.icon size={18} />
              {item.label}
              <ChevronRight size={14} className="ml-auto opacity-40" />
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
