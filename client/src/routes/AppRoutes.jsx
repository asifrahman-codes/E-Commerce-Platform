import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

import Home from "../pages/home/Home";
import Placeholder from "../pages/common/Placeholder";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

import Profile from "../pages/account/Profile";

import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Public storefront */}
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
          path="/search"
          element={<Placeholder title="Search products" />}
        />

        {/* Authenticated customer routes */}
        <Route element={<ProtectedRoute />}>

          <Route
            path="/account"
            element={<Profile />}
          />

          <Route
            path="/checkout"
            element={<Placeholder title="Checkout" />}
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

        {/* Admin routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]} />
          }
        >

          <Route
            path="/admin"
            element={<Placeholder title="Admin Dashboard" />}
          />

        </Route>

      </Route>

      {/* Guest-only authentication routes */}
      <Route element={<GuestRoute />}>

        <Route element={<AuthLayout />}>

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

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