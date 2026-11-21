const corsOrigins = (
  process.env.CORS_ORIGINS ||
  process.env.CLIENT_URL ||
  ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export default {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  apiPrefix: process.env.API_PREFIX || "/api/v1",
  trustProxy: process.env.TRUST_PROXY === "1",
  corsOrigins,
};