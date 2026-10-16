import ApiError from "./ApiError.js";

const roundMoney = (value) => {
    return Math.round(
        (Number(value) + Number.EPSILON) * 100
    ) / 100;
};

export const calculateShipping = (
    subtotalAfterDiscount,
    settings
) => {
    const amount = Number(subtotalAfterDiscount);
    const threshold = settings.free_shipping_threshold;

    if (
        threshold !== null &&
        threshold !== undefined &&
        amount >= Number(threshold)
    ) {
        return 0;
    }

    return roundMoney(settings.shipping_fee);
};

export const calculateTax = (
    subtotal,
    discount,
    settings
) => {
    if (Number(settings.tax_enabled) !== 1) {
        return 0;
    }

    const taxableAmount = Math.max(
        0,
        roundMoney(Number(subtotal) - Number(discount))
    );

    const taxRate = Number(settings.tax_rate);

    return roundMoney(taxableAmount * taxRate / 100);
};

export const calculateOrderPricing = ({
    subtotal,
    discount = 0,
    settings
}) => {
    const parsedSubtotal = Number(subtotal);
    const parsedDiscount = Number(discount);

    if (
        !Number.isFinite(parsedSubtotal) ||
        parsedSubtotal < 0
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

    const roundedSubtotal = roundMoney(parsedSubtotal);
    const roundedDiscount = roundMoney(parsedDiscount);

    const discountedSubtotal = roundMoney(
        roundedSubtotal - roundedDiscount
    );

    const shipping = calculateShipping(
        discountedSubtotal,
        settings
    );

    const tax = calculateTax(
        roundedSubtotal,
        roundedDiscount,
        settings
    );

    const total = roundMoney(
        discountedSubtotal + shipping + tax
    );

    return {
        currency: settings.currency,
        subtotal: roundedSubtotal,
        discount: roundedDiscount,
        shipping,
        tax,
        total
    };
};