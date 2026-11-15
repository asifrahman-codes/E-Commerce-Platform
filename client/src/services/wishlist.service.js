import api from "./api";

const wishlistService = {
  async getWishlist() {
    const response = await api.get("/wishlist");
    return response.data.data;
  },

  async addItem(productId) {
    const response = await api.post("/wishlist", {
      product_id: productId,
    });

    return response.data.data;
  },

  async removeItem(productId) {
    const response = await api.delete(
      `/wishlist/${productId}`
    );

    return response.data.data;
  },

  async clearWishlist() {
    const response = await api.delete("/wishlist");
    return response.data.data;
  },
};

export default wishlistService;