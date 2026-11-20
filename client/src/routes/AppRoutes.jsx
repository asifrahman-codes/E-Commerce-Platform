import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

import Home from "../pages/home/Home";
import Placeholder from "../pages/common/Placeholder";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

import AccountLayout from "../pages/account/AccountLayout";
import MyProfile from "../pages/account/MyProfile";
import MyAddresses from "../pages/account/MyAddresses";
import ChangePassword from "../pages/account/ChangePassword";

import ProductCatalog from "../pages/products/ProductCatalog";
import ProductDetails from "../pages/products/ProductDetails";

import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";

import Cart from "../pages/cart/Cart";
import Wishlist from "../pages/wishlist/Wishlist";
import Checkout from "../pages/checkout/Checkout";
import OrderConfirmation from "../pages/checkout/OrderConfirmation";
import MockPayment from "../pages/checkout/MockPayment";

import MyOrders from "../pages/orders/MyOrders";
import OrderDetails from "../pages/orders/OrderDetails";

import MyReviews from "../pages/reviews/MyReviews";

import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminOrderDetails from "../pages/admin/AdminOrderDetails";
import ReviewManagement from "../pages/admin/ReviewManagement";

import AdminProducts from "../pages/admin/products/AdminProducts";
import CreateProduct from "../pages/admin/products/CreateProduct";
import EditProduct from "../pages/admin/products/EditProduct";
import AdminProductVariants from "../pages/admin/products/AdminProductVariants";

import InventoryDashboard from "../pages/admin/inventory/InventoryDashboard";
import StockAdjustment from "../pages/admin/inventory/StockAdjustment";
import InventoryHistory from "../pages/admin/inventory/InventoryHistory";
import LowStockProducts from "../pages/admin/inventory/LowStockProducts";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public storefront */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        {/* Product routes */}
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/products/:id" element={<ProductDetails />} />

        {/* Other public routes */}
        <Route
          path="/categories"
          element={<Placeholder title="Categories" />}
        />

        <Route path="/cart" element={<Cart />} />

        <Route path="/wishlist" element={<Wishlist />} />

        <Route
          path="/search"
          element={<Placeholder title="Search Products" />}
        />

        {/* Authenticated customer routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<MyProfile />} />
            <Route path="addresses" element={<MyAddresses />} />
            <Route path="password" element={<ChangePassword />} />
          </Route>

          <Route path="/checkout" element={<Checkout />} />

          <Route
            path="/order-confirmation/:orderId"
            element={<OrderConfirmation />}
          />

          <Route path="/mock-payment/:attemptId" element={<MockPayment />} />

          <Route
            path="/notifications"
            element={<Placeholder title="Notifications" />}
          />

          <Route path="/orders" element={<MyOrders />} />

          <Route path="/orders/:orderId" element={<OrderDetails />} />

          <Route path="/my-reviews" element={<MyReviews />} />
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Orders */}
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route
              path="/admin/orders/:orderId"
              element={<AdminOrderDetails />}
            />

            {/* Reviews */}
            <Route path="/admin/reviews" element={<ReviewManagement />} />

            {/* Products */}
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/create" element={<CreateProduct />} />
            <Route path="/admin/products/:id/edit" element={<EditProduct />} />
            <Route
              path="/admin/products/:id/variants"
              element={<AdminProductVariants />}
            />

            {/* Inventory */}
            <Route path="/admin/inventory" element={<InventoryDashboard />} />
            <Route
              path="/admin/inventory/adjust"
              element={<StockAdjustment />}
            />
            <Route
              path="/admin/inventory/history"
              element={<InventoryHistory />}
            />
            <Route
              path="/admin/inventory/low-stock"
              element={<LowStockProducts />}
            />
          </Route>
        </Route>
      </Route>

      {/* Guest-only authentication routes */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={<Placeholder title="404 - Page Not Found" />}
      />
    </Routes>
  );
};

export default AppRoutes;