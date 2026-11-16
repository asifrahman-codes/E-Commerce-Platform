import api from "./api";

const cartService = {
  async getCart() {
    const response = await api.get("/cart");
    return response.data;
  },

  async addItem(variantId, quantity = 1) {
    const response = await api.post("/cart/items", {
      variant_id: variantId,
      quantity,
    });

    return response.data;
  },

  async updateItem(cartItemId, quantity) {
    const response = await api.patch(
      `/cart/items/${cartItemId}`,
      { quantity }
    );

    return response.data;
  },

  async removeItem(cartItemId) {
    const response = await api.delete(
      `/cart/items/${cartItemId}`
    );

    return response.data;
  },

  async clearCart() {
    const response = await api.delete("/cart");
    return response.data;
  },
};

export default cartService;