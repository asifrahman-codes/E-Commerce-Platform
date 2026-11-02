const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },

  PRODUCTS: {
    BASE: "/products",
    DETAILS: (id) => `/products/${id}`,
  },

  CATEGORIES: {
    BASE: "/categories",
  },

  CART: {
    BASE: "/cart",
  },

  WISHLIST: {
    BASE: "/wishlist",
  },

  ORDERS: {
    BASE: "/orders",
  },

  NOTIFICATIONS: {
    BASE: "/notifications",
  },
};

export default API_ENDPOINTS;