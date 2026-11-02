import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

import Home from "../pages/home/Home";
import Placeholder from "../pages/common/Placeholder";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Customer storefront */}
      <Route element={<MainLayout />}>

        <Route path="/" element={<Home />} />

        <Route
          path="/products"
          element={<Placeholder title="Products" />}
        />

        <Route
          path="/products/:id"
          element={<Placeholder title="Product Details" />}
        />

        <Route
          path="/categories"
          element={<Placeholder title="Categories" />}
        />

        <Route
          path="/cart"
          element={<Placeholder title="Shopping Cart" />}
        />

        <Route
          path="/wishlist"
          element={<Placeholder title="My Wishlist" />}
        />

        <Route
          path="/checkout"
          element={<Placeholder title="Checkout" />}
        />

        <Route
          path="/account"
          element={<Placeholder title="My Account" />}
        />

        <Route
          path="/orders"
          element={<Placeholder title="My Orders" />}
        />

        <Route
          path="/notifications"
          element={<Placeholder title="Notifications" />}
        />

      </Route>

      {/* Authentication pages */}
      <Route element={<AuthLayout />}>

        <Route
          path="/login"
          element={<Placeholder title="Login" />}
        />

        <Route
          path="/register"
          element={<Placeholder title="Create Account" />}
        />

        <Route
          path="/forgot-password"
          element={<Placeholder title="Forgot Password" />}
        />

      </Route>

      {/* Admin dashboard */}
      <Route
        path="/admin"
        element={<Placeholder title="Admin Dashboard" />}
      />

      {/* 404 */}
      <Route
        path="*"
        element={<Placeholder title="404 - Page Not Found" />}
      />

    </Routes>
  );
};

export default AppRoutes;