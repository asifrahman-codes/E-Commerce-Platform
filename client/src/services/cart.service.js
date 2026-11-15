import api from "./api";

const cartService = {
  async getCart() {
    const response = await api.get("/cart");
    return response.data.data;
  },

  async addItem(variantId, quantity = 1) {
    const response = await api.post("/cart/items", {
      variant_id: variantId,
      quantity,
    });

    return response.data.data;
  },

  async updateItem(cartItemId, quantity) {
    const response = await api.patch(
      `/cart/items/${cartItemId}`,
      { quantity }
    );

    return response.data.data;
  },

  async removeItem(cartItemId) {
    const response = await api.delete(
      `/cart/items/${cartItemId}`
    );

    return response.data.data;
  },

  async clearCart() {
    const response = await api.delete("/cart");
    return response.data.data;
  },
};

export default cartService;