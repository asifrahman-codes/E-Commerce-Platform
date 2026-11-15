import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import cartService from "../services/cart.service";

const CartContext = createContext(null);

const emptyCart = {
  cart_id: null,
  user_id: null,
  items: [],
  subtotal: 0,
  total_items: 0,
};

function hasAccessToken() {
  return Boolean(localStorage.getItem("accessToken"));
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshCart = useCallback(async () => {
    if (!hasAccessToken()) {
      setCart(emptyCart);
      return emptyCart;
    }

    try {
      setLoading(true);
      setError("");

      const data = await cartService.getCart();

      setCart(data || emptyCart);

      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to load your cart.";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (variantId, quantity = 1) => {
    try {
      setError("");

      const data = await cartService.addItem(
        variantId,
        quantity
      );

      setCart(data || emptyCart);

      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to add this item to your cart.";

      setError(message);
      throw err;
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    try {
      setError("");

      const data = await cartService.updateItem(
        cartItemId,
        quantity
      );

      setCart(data || emptyCart);

      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to update the cart item.";

      setError(message);
      throw err;
    }
  };

  const removeCartItem = async (cartItemId) => {
    try {
      setError("");

      const data = await cartService.removeItem(
        cartItemId
      );

      setCart(data || emptyCart);

      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to remove the cart item.";

      setError(message);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      setError("");

      const data = await cartService.clearCart();

      setCart(data || emptyCart);

      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to clear your cart.";

      setError(message);
      throw err;
    }
  };

  const resetCart = () => {
    setCart(emptyCart);
    setError("");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        refreshCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        resetCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}