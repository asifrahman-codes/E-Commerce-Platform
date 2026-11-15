import {
  createContext,
  useCallback,
  useContext,
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
        err.response?.data?.message ||
        "Unable to load your wishlist.";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWishlist = async (productId) => {
    try {
      setError("");

      await wishlistService.addItem(productId);

      // Fetch the updated wishlist because the add
      // endpoint returns only the inserted wishlist row.
      return await refreshWishlist();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to add this product to your wishlist.";

      setError(message);
      throw err;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      setError("");

      await wishlistService.removeItem(productId);

      return await refreshWishlist();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to remove this product from your wishlist.";

      setError(message);
      throw err;
    }
  };

  const clearWishlist = async () => {
    try {
      setError("");

      await wishlistService.clearWishlist();

      setWishlist(emptyWishlist);

      return emptyWishlist;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to clear your wishlist.";

      setError(message);
      throw err;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.items.some(
      (item) =>
        Number(item.product_id) === Number(productId)
    );
  };

  const resetWishlist = () => {
    setWishlist(emptyWishlist);
    setError("");
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        error,
        refreshWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        resetWishlist,
      }}
    >
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