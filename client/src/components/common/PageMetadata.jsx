import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { setPageMetadata } from "../../utils/seo.utils";

const PUBLIC_ROUTES = [
  {
    match: (path) => path === "/",
    title: "ShopSphere | Thoughtful finds for everyday living",
    description: "Discover ShopSphere products, categories, and new arrivals.",
  },
  {
    match: (path) => path === "/products" || path === "/search",
    title: "Shop all products | ShopSphere",
    description: "Search and browse ShopSphere products by category, brand, and price.",
    canonicalPath: "/products",
  },
  {
    match: (path) => path === "/categories",
    title: "Shop by category | ShopSphere",
    description: "Explore ShopSphere product categories and find what you need.",
  },
  {
    match: (path) => path === "/flash-sales",
    title: "Flash sales | ShopSphere",
    description: "Browse current ShopSphere flash sale offers and eligible products.",
  },
  {
    match: (path) => /^\/products\/[^/]+$/.test(path),
    title: "Product details | ShopSphere",
    description: "View product details, pricing, availability, and options on ShopSphere.",
  },
];

const PRIVATE_ROUTES = [
  ["/login", "Sign in | ShopSphere"],
  ["/register", "Create an account | ShopSphere"],
  ["/forgot-password", "Reset your password | ShopSphere"],
  ["/account", "My profile | ShopSphere"],
  ["/account/addresses", "My addresses | ShopSphere"],
  ["/account/password", "Change password | ShopSphere"],
  ["/account/notifications", "My notifications | ShopSphere"],
  ["/account/loyalty", "My rewards | ShopSphere"],
  ["/cart", "Shopping cart | ShopSphere"],
  ["/checkout", "Checkout | ShopSphere"],
  ["/orders", "My orders | ShopSphere"],
  ["/my-reviews", "My reviews | ShopSphere"],
  ["/wishlist", "My wishlist | ShopSphere"],
  ["/support", "Customer support | ShopSphere"],
  ["/support/tickets", "My support tickets | ShopSphere"],
  ["/compare", "Product comparison | ShopSphere"],
  ["/order-confirmation", "Order confirmation | ShopSphere"],
  ["/mock-payment", "Payment | ShopSphere"],
  ["/admin", "Admin dashboard | ShopSphere"],
  ["/admin/reports", "Sales reports | ShopSphere"],
  ["/admin/customers", "Customer management | ShopSphere"],
  ["/admin/payments", "Payment management | ShopSphere"],
  ["/admin/shipments", "Shipment management | ShopSphere"],
  ["/admin/rewards-sales", "Loyalty and flash sales | ShopSphere"],
  ["/admin/settings", "Store settings | ShopSphere"],
  ["/admin/notifications", "Notification management | ShopSphere"],
  ["/admin/product-questions", "Product questions | ShopSphere"],
  ["/admin/support", "Support tickets | ShopSphere"],
  ["/admin/orders", "Order management | ShopSphere"],
  ["/admin/reviews", "Review management | ShopSphere"],
  ["/admin/products", "Product management | ShopSphere"],
  ["/admin/products/create", "Create product | ShopSphere"],
  ["/admin/categories", "Category management | ShopSphere"],
  ["/admin/brands", "Brand management | ShopSphere"],
  ["/admin/coupons", "Coupon management | ShopSphere"],
  ["/admin/shipping-methods", "Shipping methods | ShopSphere"],
  ["/admin/inventory", "Inventory management | ShopSphere"],
  ["/admin/inventory/adjust", "Adjust stock | ShopSphere"],
  ["/admin/inventory/history", "Inventory history | ShopSphere"],
  ["/admin/inventory/low-stock", "Low-stock products | ShopSphere"],
];

const NO_INDEX_PREFIXES = [
  "/account",
  "/admin",
  "/cart",
  "/checkout",
  "/login",
  "/register",
  "/forgot-password",
  "/mock-payment",
  "/notifications",
  "/orders",
  "/order-confirmation",
  "/support",
  "/wishlist",
  "/my-reviews",
  "/compare",
];

export default function PageMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const route = PUBLIC_ROUTES.find(({ match }) => match(pathname));
    const privateRoute = PRIVATE_ROUTES
      .filter(([path]) => pathname === path || pathname.startsWith(`${path}/`))
      .sort(([left], [right]) => right.length - left.length)[0];
    const dynamicPrivateTitle =
      /^\/orders\/[^/]+$/.test(pathname)
        ? "Order details | ShopSphere"
        : /^\/support\/tickets\/[^/]+$/.test(pathname)
          ? "Support ticket | ShopSphere"
          : /^\/admin\/orders\/[^/]+$/.test(pathname)
            ? "Order details | ShopSphere"
            : /^\/admin\/support\/[^/]+$/.test(pathname)
              ? "Support ticket | ShopSphere"
              : /^\/admin\/products\/[^/]+\/edit$/.test(pathname)
                ? "Edit product | ShopSphere"
                : /^\/admin\/products\/[^/]+\/variants$/.test(pathname)
                  ? "Product variants | ShopSphere"
                  : undefined;
    const noIndex = !route || NO_INDEX_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
    const canonicalPath = route?.canonicalPath ?? pathname;
    const configuredSiteUrl = import.meta.env.VITE_SITE_URL;
    const siteOrigin = configuredSiteUrl
      ? new URL(configuredSiteUrl).origin
      : window.location.origin;
    const canonicalUrl = noIndex
      ? null
      : `${siteOrigin}${canonicalPath}`;

    setPageMetadata({
      title: route?.title ?? dynamicPrivateTitle ?? privateRoute?.[1] ?? "Page not found | ShopSphere",
      description: route?.description ?? "ShopSphere account and store management.",
      canonicalUrl,
      robots: noIndex ? "noindex,nofollow" : "index,follow",
    });
  }, [pathname]);

  return null;
}
