import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ProductComparisonProvider } from "./context/ProductComparisonContext";

import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <ProductComparisonProvider>
          <CartProvider>
            <WishlistProvider>
              <App />
            </WishlistProvider>
          </CartProvider>
        </ProductComparisonProvider>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);