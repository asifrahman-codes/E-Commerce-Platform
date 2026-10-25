import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import routes from "./routes/index.js";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";
import {
  requestIdMiddleware,
  generalApiLimiter,
} from "./middleware/rate-limit.middleware.js";
import { pool } from "./database/index.js";

const app = express();

app.disable("x-powered-by");

if (process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1);
}

app.use(requestIdMiddleware);
app.use(helmet());

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  process.env.CLIENT_URL ||
  ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Commerce API is running",
    requestId: req.requestId,
  });
});

app.get("/health/live", (req, res) => {
  res.status(200).json({
    success: true,
    status: "alive",
    requestId: req.requestId,
  });
});

app.get("/health/ready", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      success: true,
      status: "ready",
      database: "connected",
      requestId: req.requestId,
    });
  } catch (error) {
    console.error("Database readiness check failed:", {
      requestId: req.requestId,
      message: error.message,
    });

    res.status(503).json({
      success: false,
      status: "not_ready",
      requestId: req.requestId,
    });
  }
});

app.use(
  process.env.API_PREFIX || "/api/v1",
  generalApiLimiter,
  routes
);

app.use(notFound);
app.use(errorHandler);

export default app;