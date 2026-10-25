import multer from "multer";

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const requestId = req.requestId;

  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "Each image must not exceed 5 MB.",
      LIMIT_FILE_COUNT: "You can upload a maximum of 5 images.",
    };

    return res.status(400).json({
      success: false,
      message: messages[err.code] || err.message,
      requestId,
    });
  }

  const statusCode =
    Number.isInteger(err.statusCode) &&
    err.statusCode >= 400 &&
    err.statusCode <= 599
      ? err.statusCode
      : 500;

  const isProduction = process.env.NODE_ENV === "production";

  if (statusCode >= 500) {
    console.error({
      message: "API request failed",
      requestId,
      statusCode,
      error: err.message,
      path: req.path,
      method: req.method,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message:
      isProduction && statusCode >= 500
        ? "An unexpected server error occurred."
        : err.message || "Internal Server Error",
    requestId,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

export default errorHandler;