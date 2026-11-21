import ApiError from "../utils/ApiError.js";

const REQUEST_SOURCES = new Set(["body", "params", "query"]);

const validate = (schema, source = "body") => {
  if (!REQUEST_SOURCES.has(source)) {
    throw new TypeError(`Unsupported validation source: ${source}`);
  }

  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      convert: true,
      stripUnknown: source === "body",
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return next(new ApiError(400, "Validation Failed", { errors }));
    }

    if (source === "body") {
      req.body = value;
    } else {
      req.validated = {
        ...req.validated,
        [source]: value,
      };
    }

    return next();
  };
};

export default validate;