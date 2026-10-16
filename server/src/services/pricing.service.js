import ApiError from "../utils/ApiError.js";
import {
    getActivePricingSettings
} from "../repositories/pricing.repository.js";

import {
    calculateOrderPricing
} from "../utils/pricing.js";

export const previewPricingService = async ({
    subtotal,
    discount = 0
}) => {
    const parsedSubtotal = Number(subtotal);
    const parsedDiscount = Number(discount);

    if (
        !Number.isFinite(parsedSubtotal) ||
        parsedSubtotal <= 0
    ) {
        throw new ApiError(400, "Invalid subtotal.");
    }

    if (
        !Number.isFinite(parsedDiscount) ||
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