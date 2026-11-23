import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

import Placeholder from "../pages/common/Placeholder";
import LoadingScreen from "../components/common/LoadingScreen";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";

import AdminAIAssistant from "../pages/admin/AdminAIAssistant";

const Home = lazy(() => import("../pages/home/Home"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));

const AccountLayout = lazy(() => import("../pages/account/AccountLayout"));
const MyProfile = lazy(() => import("../pages/account/MyProfile"));
const MyAddresses = lazy(() => import("../pages/account/MyAddresses"));
const ChangePassword = lazy(() => import("../pages/account/ChangePassword"));
const Notifications = lazy(() => import("../pages/account/Notifications"));

const ProductCatalog = lazy(() => import("../pages/products/ProductCatalog"));
const CategoryCatalog = lazy(() => import("../pages/products/CategoryCatalog"));
const ProductDetails = lazy(() => import("../pages/products/ProductDetails"));
const ProductComparison = lazy(() => import("../pages/products/ProductComparison"));
const FlashSales = lazy(() => import("../pages/products/FlashSales"));
const LoyaltyDashboard = lazy(() => import("../pages/account/LoyaltyDashboard"));
const SupportCenter = lazy(() => import("../pages/support/SupportCenter"));
const MySupportTickets = lazy(() => import("../pages/support/MySupportTickets"));
const SupportTicketDetails = lazy(() => import("../pages/support/SupportTicketDetails"));

const Cart = lazy(() => import("../pages/cart/Cart"));
const Wishlist = lazy(() => import("../pages/wishlist/Wishlist"));
const SharedWishlist = lazy(() => import("../pages/wishlist/SharedWishlist"));
const Checkout = lazy(() => import("../pages/checkout/Checkout"));
const OrderConfirmation = lazy(() => import("../pages/checkout/OrderConfirmation"));
const MockPayment = lazy(() => import("../pages/checkout/MockPayment"));

const MyOrders = lazy(() => import("../pages/orders/MyOrders"));
const OrderDetails = lazy(() => import("../pages/orders/OrderDetails"));

const MyReviews = lazy(() => import("../pages/reviews/MyReviews"));

const AdminLayout = lazy(() => import("../pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("../pages/admin/AdminOrders"));
const AdminOrderDetails = lazy(() => import("../pages/admin/AdminOrderDetails"));
const ReviewManagement = lazy(() => import("../pages/admin/ReviewManagement"));
const AdminRewardsSales = lazy(() => import("../pages/admin/AdminRewardsSales"));
const ProductQuestionManagement = lazy(() => import("../pages/admin/ProductQuestionManagement"));
const AdminSupportTickets = lazy(() => import("../pages/admin/AdminSupportTickets"));
const AdminSupportTicketDetails = lazy(() => import("../pages/admin/AdminSupportTicketDetails"));
const AdminCategoryManagement = lazy(() => import("../pages/admin/AdminCategoryManagement"));
const AdminBrandManagement = lazy(() => import("../pages/admin/AdminBrandManagement"));
const AdminCoupons = lazy(() => import("../pages/admin/AdminCoupons"));
const AdminShippingMethods = lazy(() => import("../pages/admin/AdminShippingMethods"));
const AdminPayments = lazy(() => import("../pages/admin/AdminPayments"));
const AdminShipments = lazy(() => import("../pages/admin/AdminShipments"));
const AdminCustomers = lazy(() => import("../pages/admin/AdminCustomers"));
const AdminReports = lazy(() => import("../pages/admin/AdminReports"));
const AdminPlatform = lazy(() => import("../pages/admin/AdminPlatform"));

const AdminProducts = lazy(() => import("../pages/admin/products/AdminProducts"));
const CreateProduct = lazy(() => import("../pages/admin/products/CreateProduct"));
const EditProduct = lazy(() => import("../pages/admin/products/EditProduct"));
const AdminProductVariants = lazy(() => import("../pages/admin/products/AdminProductVariants"));

const InventoryDashboard = lazy(() => import("../pages/admin/inventory/InventoryDashboard"));
const StockAdjustment = lazy(() => import("../pages/admin/inventory/StockAdjustment"));
const InventoryHistory = lazy(() => import("../pages/admin/inventory/InventoryHistory"));
const LowStockProducts = lazy(() => import("../pages/admin/inventory/LowStockProducts"));

const routePage = (Component) => (
  <Suspense fallback={<LoadingScreen message="Loading page..." />}>
    <Component />
  </Suspense>
);

const AppRoutes = () => (
    <Routes>
      {/* Public storefront */}
      <Route element={<MainLayout />}>
        <Route path="/" element={routePage(Home)} />

        {/* Product routes */}
        <Route path="/products" element={routePage(ProductCatalog)} />
        <Route path="/search" element={routePage(ProductCatalog)} />
        <Route path="/products/:id" element={routePage(ProductDetails)} />
        <Route path="/compare" element={routePage(ProductComparison)} />
        <Route path="/flash-sales" element={routePage(FlashSales)} />

        {/* Other public routes */}
        <Route path="/categories" element={routePage(CategoryCatalog)} />

        <Route path="/cart" element={routePage(Cart)} />

        <Route path="/wishlist" element={routePage(Wishlist)} />
        <Route path="/wishlist/shared/:token" element={routePage(SharedWishlist)} />


        {/* Authenticated customer routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={routePage(AccountLayout)}>
            <Route index element={routePage(MyProfile)} />
            <Route path="addresses" element={routePage(MyAddresses)} />
            <Route path="password" element={routePage(ChangePassword)} />
            <Route path="notifications" element={routePage(Notifications)} />
            <Route path="loyalty" element={routePage(LoyaltyDashboard)} />
          </Route>

          <Route path="/support" element={routePage(SupportCenter)} />
          <Route path="/support/tickets" element={routePage(MySupportTickets)} />
          <Route path="/support/tickets/:ticketId" element={routePage(SupportTicketDetails)} />

          <Route path="/checkout" element={routePage(Checkout)} />

          <Route
            path="/order-confirmation/:orderId"
            element={routePage(OrderConfirmation)}
          />

          <Route path="/mock-payment/:attemptId" element={routePage(MockPayment)} />

          <Route
            path="/notifications"
            element={<Navigate to="/account/notifications" replace />}
          />

          <Route path="/orders" element={routePage(MyOrders)} />

          <Route path="/orders/:orderId" element={routePage(OrderDetails)} />

          <Route path="/my-reviews" element={routePage(MyReviews)} />
        </Route>

      </Route>

      {/* Admin routes use a separate workspace shell, still protected by role. */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={routePage(AdminLayout)}>
          <Route path="/admin" element={routePage(AdminDashboard)} />
          <Route path="/admin/reports" element={routePage(AdminReports)} />
          <Route path="/admin/customers" element={routePage(AdminCustomers)} />
          <Route path="/admin/payments" element={routePage(AdminPayments)} />
          <Route path="/admin/shipments" element={routePage(AdminShipments)} />
          <Route path="/admin/rewards-sales" element={routePage(AdminRewardsSales)} />
          <Route path="/admin/settings" element={routePage(AdminPlatform)} />
          <Route path="/admin/notifications" element={routePage(Notifications)} />
          <Route path="/admin/product-questions" element={routePage(ProductQuestionManagement)} />
          <Route path="/admin/support" element={routePage(AdminSupportTickets)} />
          <Route path="/admin/support/:ticketId" element={routePage(AdminSupportTicketDetails)} />
          <Route path="/admin/orders" element={routePage(AdminOrders)} />
          <Route path="/admin/orders/:orderId" element={routePage(AdminOrderDetails)} />
          <Route path="/admin/reviews" element={routePage(ReviewManagement)} />
          <Route path="/admin/products" element={routePage(AdminProducts)} />
          <Route path="/admin/products/create" element={routePage(CreateProduct)} />
          <Route path="/admin/products/:id/edit" element={routePage(EditProduct)} />
          <Route path="/admin/products/:id/variants" element={routePage(AdminProductVariants)} />
          <Route path="/admin/categories" element={routePage(AdminCategoryManagement)} />
          <Route path="/admin/brands" element={routePage(AdminBrandManagement)} />
          <Route path="/admin/coupons" element={routePage(AdminCoupons)} />
          <Route path="/admin/shipping-methods" element={routePage(AdminShippingMethods)} />
          <Route path="/admin/inventory" element={routePage(InventoryDashboard)} />
          <Route path="/admin/inventory/adjust" element={routePage(StockAdjustment)} />
          <Route path="/admin/inventory/history" element={routePage(InventoryHistory)} />
          <Route path="/admin/inventory/low-stock" element={routePage(LowStockProducts)} />
          <Route
            path="/admin/ai-assistant"
            element={routePage(AdminAIAssistant)}
          />
        </Route>
      </Route>

      {/* Guest-only authentication routes */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={routePage(Login)} />
          <Route path="/register" element={routePage(Register)} />
          <Route path="/forgot-password" element={routePage(ForgotPassword)} />
        </Route>
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={<Placeholder title="404 - Page Not Found" />}
      />
    </Routes>
);

export default AppRoutes;