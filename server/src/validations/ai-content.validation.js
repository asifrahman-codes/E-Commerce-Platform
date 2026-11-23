
import ApiError from "../utils/ApiError.js";

const ALLOWED_TYPES = [
    "product_description",
    "seo",
    "marketing",
    "social_caption",
    "campaign",
];

export function validateAIContentRequest(req, res, next) {

    const {
        type,
        product_name,
        details,
    } = req.body ?? {};

    if (!ALLOWED_TYPES.includes(type)) {

        return next(
            new ApiError(400, "Invalid content generation type.")
        );

    }

    if (
        type !== "campaign" &&
        (
            typeof product_name !== "string" ||
            !product_name.trim()
        )
    ) {

        return next(
            new ApiError(400, "Product name is required.")
        );

    }

    if (
        typeof product_name === "string" &&
        product_name.length > 150
    ) {

        return next(
            new ApiError(400, "Product name is too long.")
        );

    }

    if (
        typeof details === "string" &&
        details.length > 2000
    ) {

        return next(
            new ApiError(400, "Product details are too long.")
        );

    }

    next();

}
