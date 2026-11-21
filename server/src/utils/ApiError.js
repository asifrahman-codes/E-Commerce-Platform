class ApiError extends Error {
  constructor(statusCode, message, { errors } = {}) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;

    if (errors) {
      this.errors = errors;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;