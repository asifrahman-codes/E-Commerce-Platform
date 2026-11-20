import ApiError from "../utils/ApiError.js";

import {
    findInventoryDashboard,
    findLowStockVariants,
    findInventoryHistory,
    adjustVariantStock
} from "../repositories/admin-inventory.repository.js";

const TRANSACTION_TYPES = [
    "PURCHASE",
    "ADJUSTMENT"
];

function positiveId(value, field) {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new ApiError(400, `Invalid ${field}.`);
    }

    return id;
}

export const getInventoryDashboardService = async () => {
    return findInventoryDashboard();
};

export const getLowStockService = async (threshold = 5) => {
    const value = Number(threshold);

    if (!Number.isSafeInteger(value) || value < 0 || value > 100000) {
        throw new ApiError(400, "Invalid low stock threshold.");
    }

    return findLowStockVariants(value);
};

export const getInventoryHistoryService = async (filters) => {
    const page = Number(filters.page || 1);
    const limit = Number(filters.limit || 20);

    if (!Number.isInteger(page) || page < 1) {
        throw new ApiError(400, "Invalid page.");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new ApiError(400, "Limit must be between 1 and 100.");
    }

    const allowedTypes = [
        "",
        "PURCHASE",
        "SALE",
        "RETURN",
        "ADJUSTMENT"
    ];

    const type = filters.transaction_type || "";

    if (!allowedTypes.includes(type)) {
        throw new ApiError(400, "Invalid transaction type.");
    }

    return findInventoryHistory({
        page,
        limit,
        transaction_type: type,
        variant_id: filters.variant_id
            ? positiveId(filters.variant_id, "variant ID")
            : null
    });
};

export const adjustStockService = async (input) => {
    const variantId = positiveId(input.variant_id, "variant ID");

    const quantity = Number(input.quantity_change);

    if (!Number.isSafeInteger(quantity) || quantity === 0) {
        throw new ApiError(
            400,
            "Quantity change must be a non-zero integer."
        );
    }

    const type = input.transaction_type;

    if (!TRANSACTION_TYPES.includes(type)) {
        throw new ApiError(
            400,
            "Manual adjustments support PURCHASE and ADJUSTMENT only."
        );
    }

    const notes = String(input.notes || "").trim();

    if (notes.length > 255) {
        throw new ApiError(400, "Notes cannot exceed 255 characters.");
    }

    if (type === "PURCHASE" && quantity < 0) {
        throw new ApiError(400, "Purchase quantity must be positive.");
    }

    return adjustVariantStock({
        variant_id: variantId,
        quantity_change: quantity,
        transaction_type: type,
        reference_id: null,
        notes: notes || null
    });
};