import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import routes from "./routes/index.js";

app.use(process.env.API_PREFIX, routes);

const app = express();

/*
|--------------------------------------------------------------------------
| Global Middlewares
|--------------------------------------------------------------------------
*/

app.use(helmet());

app.use(cors());

app.use(compression());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(morgan("dev"));

/*
|--------------------------------------------------------------------------
| Health Check Route
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Commerce API is running 🚀",
  });
});

export default app;




// Browser / React
//         │
//         ▼
// server.js
//         │
//         ▼
// app.js
//         │
//         ▼
// Middlewares
//         │
//         ▼
// Routes
//         │
//         ▼
// Response