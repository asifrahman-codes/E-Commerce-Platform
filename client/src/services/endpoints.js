const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },

  PRODUCTS: {
    BASE: "/products",
    SEARCH: "/products/search",
    DETAILS: (id) => `/products/${id}`,
    IMAGES: (id) => `/products/${id}/images`,
  },

  CATEGORIES: {
    BASE: "/categories",
    DETAILS: (id) => `/categories/${id}`,
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