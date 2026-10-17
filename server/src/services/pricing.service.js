import ApiError from "../utils/ApiError.js";

import {
    getActivePricingSettings
} from "../repositories/pricing.repository.js";

import {
    calculateOrderPricing
} from "../utils/pricing.js";

function parseAmount(value, fieldName) {
    if (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
    ) {
        throw new ApiError(400, `Invalid ${fieldName}.`);
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        throw new ApiError(400, `Invalid ${fieldName}.`);
    }

    return amount;
}

export const previewPricingService = async ({
    subtotal,
    discount = 0
}) => {
    const parsedSubtotal = parseAmount(subtotal, "subtotal");
    const parsedDiscount = parseAmount(discount, "discount");

    if (parsedSubtotal <= 0) {
        throw new ApiError(
            400,
            "Subtotal must be greater than zero."
        );
    }

    if (
        parsedDiscount < 0 ||
        parsedDiscount > parsedSubtotal
    ) {
        throw new ApiError(400, "Invalid discount.");
    }

    const settings = await getActivePricingSettings();

    return calculateOrderPricing({
        subtotal: parsedSubtotal,
        discount: parsedDiscount,
        settings
    });
};