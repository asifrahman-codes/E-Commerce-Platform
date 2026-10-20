const paymentConfig = {
  provider: process.env.PAYMENT_PROVIDER || "mock",

  currency: process.env.PAYMENT_CURRENCY || "PKR",

  appUrl: process.env.APP_URL || "http://localhost:5173",

  apiUrl: process.env.API_URL || "http://localhost:5000",

  mockSecret: process.env.MOCK_PAYMENT_SECRET,
};

export default paymentConfig;