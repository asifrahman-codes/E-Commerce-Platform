
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import wishlistService from "../services/wishlist.service";

const WishlistContext = createContext(null);

const emptyWishlist = {
  total_items: 0,
  items: [],
};

function hasAccessToken() {
  return Boolean(localStorage.getItem("accessToken"));
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(emptyWishlist);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshWishlist = useCallback(async () => {
    if (!hasAccessToken()) {
      setWishlist(emptyWishlist);
      return emptyWishlist;
    }

    try {
      setLoading(true);
      setError("");

      const data = await wishlistService.getWishlist();

      setWishlist(data || emptyWishlist);

      return data;
    } catch (err) {
      const message =
        err.message ||
        "Unable to load your wishlist.";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Automatically restore wishlist when provider loads.
  useEffect(() => {
    if (hasAccessToken()) {
      refreshWishlist().catch(() => {});
    }
  }, [refreshWishlist]);

  const addToWishlist = useCallback(async (productId) => {
    try {
      setError("");

      await wishlistService.addItem(productId);

      // Fetch updated wishlist because the add
      // endpoint returns only the inserted wishlist row.
      return await refreshWishlist();
    } catch (err) {
      const message =
        err.message ||
        "Unable to add this product to your wishlist.";

      setError(message);
      throw err;
    }
  }, [refreshWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      setError("");

      await wishlistService.removeItem(productId);

      return await refreshWishlist();
    } catch (err) {
      const message =
        err.message ||
        "Unable to remove this product from your wishlist.";

      setError(message);
      throw err;
    }
  }, [refreshWishlist]);

  const clearWishlist = useCallback(async () => {
    try {
      setError("");

      await wishlistService.clearWishlist();

      setWishlist(emptyWishlist);

      return emptyWishlist;
    } catch (err) {
      const message =
        err.message ||
        "Unable to clear your wishlist.";

      setError(message);
      throw err;
    }
  }, []);

  const isInWishlist = useCallback((productId) => {
    return wishlist.items.some(
      (item) =>
        Number(item.product_id) === Number(productId)
    );
  }, [wishlist.items]);

  const resetWishlist = useCallback(() => {
    setWishlist(emptyWishlist);
    setError("");
  }, []);

  const value = useMemo(() => ({
    wishlist,
    loading,
    error,
    refreshWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    resetWishlist,
  }), [
    wishlist,
    loading,
    error,
    refreshWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    resetWishlist,
  ]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
}
