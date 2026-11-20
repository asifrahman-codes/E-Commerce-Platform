const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/token/logout",
    REFRESH: "/token/refresh",
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
    ADMIN_PRODUCT_VARIANTS: (id) => `/admin/products/${id}/variants`,
  },

  CATEGORIES: {
    BASE: "/categories",
    DETAILS: (id) => `/categories/${id}`,
  },

  CART: { BASE: "/cart" },
  WISHLIST: { BASE: "/wishlist" },
  ORDERS: {
    BASE: "/orders",
    PREVIEW: "/orders/preview",
    DETAILS: (id) => `/orders/${id}`,
    CANCEL: (id) => `/orders/${id}/cancel`,
  },

  ADDRESSES: {
    BASE: "/addresses",
    DETAILS: (id) => `/addresses/${id}`,
    DEFAULT: (id) => `/addresses/${id}/default`,
  },

  PAYMENTS: {
    COD: (orderId) => `/payments/orders/${orderId}`,
    ONLINE_CHECKOUT: (orderId) => `/payments/online/orders/${orderId}/checkout`,
    ONLINE_ATTEMPT: (attemptId) => `/payments/online/attempts/${attemptId}`,
    MOCK_COMPLETE: (attemptId) => `/payments/online/mock/attempts/${attemptId}/complete`,
  },
  NOTIFICATIONS: { BASE: "/notifications" },

  REVIEWS: {
  PRODUCT: (productId) => `/reviews/products/${productId}`,
  BASE: "/reviews",
  MY_REVIEWS: "/reviews/my-reviews",
  DETAILS: (reviewId) => `/reviews/${reviewId}`,
  ADMIN: "/reviews/admin",
  MODERATE: (reviewId) =>
    `/reviews/admin/${reviewId}/moderate`,
 },

  USERS: {
      ME: "/users/me",
      UPDATE_PROFILE: "/users/me",
      CHANGE_PASSWORD: "/users/me/password",
  },

  ADDRESSES: {
      BASE: "/addresses",
      DETAILS: (id) => `/addresses/${id}`,
      DEFAULT: (id) => `/addresses/${id}/default`,
  },
  
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
  },

  ADMIN_ORDERS: {
      BASE: "/admin/orders",
      DETAILS: (id) => `/admin/orders/${id}`,
  },

  SHIPPING: {
      METHODS: "/shipping/methods",
      ADMIN_METHODS: "/shipping/admin/methods",
      ADMIN_SHIPMENTS: "/shipping/admin/shipments",
      UPDATE_SHIPMENT: (id) =>
          `/shipping/admin/shipments/${id}/status`,
      TRACKING: (id) =>
          `/shipping/shipments/${id}/tracking`,
  },

  ADMIN_PRODUCTS: {
    BASE: "/admin/products",
    DETAILS: (id) => `/admin/products/${id}`,
    STATUS: (id) => `/admin/products/${id}/status`,
  },

  ADMIN_INVENTORY: {
      DASHBOARD: "/admin/inventory/dashboard",
      LOW_STOCK: "/admin/inventory/low-stock",
      HISTORY: "/admin/inventory/history",
      ADJUST: "/admin/inventory/adjust",
  },

    ADMIN_PRODUCTS: {
        BASE: "/admin/products",
        DETAILS: (id) => `/admin/products/${id}`,
        STATUS: (id) => `/admin/products/${id}/status`,
        IMAGES: (id) => `/products/${id}/images`,
        IMAGE: (imageId) => `/products/images/${imageId}`,
        IMAGE_PRIMARY: (imageId) => `/products/images/${imageId}/primary`,
    },
        
};

export default API_ENDPOINTS;
