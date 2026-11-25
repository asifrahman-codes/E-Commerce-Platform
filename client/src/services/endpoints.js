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
    COMPARE: "/products/compare",
    DETAILS: (id) => `/products/${id}`,
    IMAGES: (id) => `/products/${id}/images`,
    VARIANTS: (id) => `/products/${id}/variants`,
  },

  RECOMMENDATIONS: {
    BASE: "/recommendations",
    PERSONALIZED: "/recommendations/personalized",
    RECENTLY_VIEWED: "/recommendations/recently-viewed",
    FOR_PRODUCT: (id) => `/recommendations/products/${id}`,
  },
  LOYALTY: {
    ACCOUNT: "/loyalty/me",
    TRANSACTIONS: "/loyalty/transactions",
    ADMIN_SETTINGS: "/loyalty/admin/settings",
  },
  FLASH_SALES: {
    BASE: "/flash-sales",
    ADMIN: "/admin/flash-sales",
    ADMIN_DETAILS: (id) => `/admin/flash-sales/${id}`,
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
    IMAGE: (id) => `/categories/${id}/image`,
  },

  BRANDS: {
    BASE: "/brands",
    DETAILS: (id) => `/brands/${id}`,
  },

  COUPONS: {
    BASE: "/coupons",
    DETAILS: (id) => `/coupons/${id}`,
    DEACTIVATE: (id) => `/coupons/${id}/deactivate`,
  },

  CART: { BASE: "/cart" },
  WISHLIST: { BASE: "/wishlist" },

  ORDERS: {
    BASE: "/orders",
    PREVIEW: "/orders/preview",
    DETAILS: (id) => `/orders/${id}`,
    CANCEL: (id) => `/orders/${id}/cancel`,
  },

  USERS: {
    ME: "/users/me",
    UPDATE_PROFILE: "/users/me",
    CHANGE_PASSWORD: "/users/me/password",
    DEACTIVATE: "/users/me/deactivate",
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

  NOTIFICATIONS: {
    BASE: "/notifications",
    UNREAD_COUNT: "/notifications/unread-count",
    READ_ALL: "/notifications/read-all",
    READ: (id) => `/notifications/${id}/read`,
    DELETE: (id) => `/notifications/${id}`,
    CLEAR: "/notifications",
  },

  REVIEWS: {
    PRODUCT: (productId) => `/reviews/products/${productId}`,
    BASE: "/reviews",
    MY_REVIEWS: "/reviews/my-reviews",
    DETAILS: (reviewId) => `/reviews/${reviewId}`,
    ADMIN: "/reviews/admin",
    MODERATE: (reviewId) => `/reviews/admin/${reviewId}/moderate`,
  },
  PRODUCT_QA: {
    PRODUCT: (productId) => `/product-qa/products/${productId}/questions`,
    ANSWER_USEFUL: (answerId) => `/product-qa/answers/${answerId}/useful`,
    ADMIN_QUESTIONS: "/product-qa/admin/questions",
    MODERATE_QUESTION: (id) => `/product-qa/admin/questions/${id}/moderation`,
    ANSWER_QUESTION: (id) => `/product-qa/admin/questions/${id}/answer`,
    MODERATE_ANSWER: (id) => `/product-qa/admin/answers/${id}/moderation`,
  },
  SUPPORT: {
    TICKETS: "/support/tickets",
    TICKET: (id) => `/support/tickets/${id}`,
    TICKET_MESSAGES: (id) => `/support/tickets/${id}/messages`,
    ADMIN_TICKETS: "/support/admin/tickets",
    ADMIN_TICKET: (id) => `/support/admin/tickets/${id}`,
    ADMIN_MESSAGES: (id) => `/support/admin/tickets/${id}/messages`,
    ADMIN_UPDATE: (id) => `/support/admin/tickets/${id}`,
    ADMIN_ASSIGN_TO_ME: (id) => `/support/admin/tickets/${id}/assign-to-me`,
  },

  ADMIN: {
    DASHBOARD: "/admin/dashboard",
  },

  ADMIN_ORDERS: {
    BASE: "/admin/orders",
    DETAILS: (id) => `/admin/orders/${id}`,
    STATUS: (id) => `/admin/orders/${id}/status`,
    PAYMENT_STATUS: (id) => `/admin/orders/${id}/payment-status`,
    CANCEL: (id) => `/admin/orders/${id}/cancel`,
  },

  SHIPPING: {
    METHODS: "/shipping/methods",
    ADMIN_METHODS: "/shipping/admin/methods",
    ADMIN_SHIPMENTS: "/shipping/admin/shipments",
    UPDATE_SHIPMENT: (id) => `/shipping/admin/shipments/${id}/status`,
    UPDATE_SHIPMENT_DETAILS: (id) => `/shipping/admin/shipments/${id}`,
    TRACKING: (id) => `/shipping/shipments/${id}/tracking`,
  },

  ADMIN_PRODUCTS: {
    BASE: "/admin/products",
    DETAILS: (id) => `/admin/products/${id}`,
    STATUS: (id) => `/admin/products/${id}/status`,
    IMAGES: (id) => `/products/${id}/images`,
    IMAGE: (imageId) => `/products/images/${imageId}`,
    IMAGE_PRIMARY: (imageId) => `/products/images/${imageId}/primary`,
  },

  ADMIN_INVENTORY: {
    DASHBOARD: "/admin/inventory/dashboard",
    LOW_STOCK: "/admin/inventory/low-stock",
    HISTORY: "/admin/inventory/history",
    ADJUST: "/admin/inventory/adjust",
  },

  ADMIN_DASHBOARD: {
    OVERVIEW: "/admin/dashboard/overview",
    SALES: "/admin/dashboard/sales",
    ORDERS: "/admin/dashboard/orders",
    TOP_PRODUCTS: "/admin/dashboard/top-products",
    RECENT_ORDERS: "/admin/dashboard/recent-orders",
    CUSTOMERS: "/admin/dashboard/customers",
  },

  AI: {
  ASSISTANT: "/ai/assistant",
  REVIEW_SUMMARY: (productId) => `/ai/products/${productId}/review-summary`,
  SEMANTIC_SEARCH: "/ai/search",
 },

 AI_ADMIN: {
    INVENTORY_INSIGHTS: "/ai/admin/inventory-insights",
    CHAT: "/ai/admin/chat",
    GENERATE_CONTENT: "/ai/admin/generate-content",
  },

};

export default API_ENDPOINTS;
