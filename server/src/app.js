import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import routes from "./routes/index.js";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

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
        message: "E-Commerce API is running 🚀"
    });
});

app.use("/api/v1", routes);

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use(process.env.API_PREFIX, routes);

/*
|--------------------------------------------------------------------------
| Error Middlewares
|--------------------------------------------------------------------------
*/

app.use(notFound);

app.use(errorHandler);

export default app;