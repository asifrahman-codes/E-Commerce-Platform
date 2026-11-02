const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
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
    ADD: "/cart",
  },

  WISHLIST: {
    BASE: "/wishlist",
  },

  ORDERS: {
    BASE: "/orders",
  },

  PAYMENTS: {
    BASE: "/payments",
  },

  NOTIFICATIONS: {
    BASE: "/notifications",
    UNREAD_COUNT: "/notifications/unread-count",
  },
};

export default API_ENDPOINTS;