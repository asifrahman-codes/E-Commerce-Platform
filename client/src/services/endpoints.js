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
    VARIANTS: (id) => `/products/${id}/variants`,
  },

  VARIANTS: {
    DETAILS: (id) => `/variants/${id}`,
    UPDATE: (id) => `/variants/${id}`,
    DELETE: (id) => `/variants/${id}`,
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

  PRODUCTS: {
    BASE: "/products",
    SEARCH: "/products/search",
    DETAILS: (id) => `/products/${id}`,
    IMAGES: (id) => `/products/${id}/images`,
    VARIANTS: (id) => `/products/${id}/variants`,
},

VARIANTS: {
    DETAILS: (id) => `/variants/${id}`,
    UPDATE: (id) => `/variants/${id}`,
    DELETE: (id) => `/variants/${id}`,
    ADMIN_PRODUCT_VARIANTS: (id) => `/admin/products/${id}/variants`,
},

};

export default API_ENDPOINTS;