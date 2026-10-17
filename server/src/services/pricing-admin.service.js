import { pool } from "../database/index.js";
import ApiError from "../utils/ApiError.js";

import {
    getActivePricingSettings,
    getPricingSettingsForUpdate,
    updatePricingSettings
} from "../repositories/pricing.repository.js";

const ALLOWED_FIELDS = new Set([
    "currency",
    "shipping_fee",
    "free_shipping_threshold",
    "tax_rate",
    "tax_enabled"
]);

function parseAmount(value, fieldName, { nullable = false } = {}) {
    if (nullable && value === null) {
        return null;
    }

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

function validatePricingSettings(settings) {
    const shippingFee = parseAmount(
        settings.shipping_fee,
        "shipping fee"
    );

    if (shippingFee < 0) {
        throw new ApiError(
            400,
            "Shipping fee cannot be negative."
        );
    }

    if (settings.free_shipping_threshold !== null) {
        const threshold = parseAmount(
            settings.free_shipping_threshold,
            "free shipping threshold"
        );

        if (threshold < 0) {
            throw new ApiError(
                400,
                "Free shipping threshold cannot be negative."
            );
        }
    }

    const taxRate = parseAmount(settings.tax_rate, "tax rate");

    if (taxRate < 0 || taxRate > 100) {
        throw new ApiError(
            400,
            "Tax rate must be between 0 and 100."
        );
    }

    if (
        ![0, 1, "0", "1"].includes(settings.tax_enabled)
    ) {
        throw new ApiError(
            400,
            "tax_enabled must be 0 or 1."
        );
    }

    if (
        typeof settings.currency !== "string" ||
        !/^[A-Z]{3}$/.test(settings.currency)
    ) {
        throw new ApiError(
            400,
            "Currency must be a three-letter uppercase code."
        );
    }
}

export const getPricingSettingsService = async () => {
    return getActivePricingSettings();
};

export const updatePricingSettingsService = async (data) => {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new ApiError(400, "Invalid pricing settings.");
    }

    for (const key of Object.keys(data)) {
        if (!ALLOWED_FIELDS.has(key)) {
            throw new ApiError(
                400,
                `Field '${key}' cannot be updated.`
            );
        }
    }

    const cleanData = Object.fromEntries(
        Object.entries(data).filter(
            ([, value]) => value !== undefined
        )
    );

    if (Object.keys(cleanData).length === 0) {
        throw new ApiError(
            400,
            "Provide at least one setting to update."
        );
    }

    if (Object.hasOwn(cleanData, "currency")) {
        if (typeof cleanData.currency === "string") {
            cleanData.currency = cleanData.currency.trim().toUpperCase();
        }
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const existing = await getPricingSettingsForUpdate(connection);

        const merged = {
            ...existing,
            ...cleanData
        };

        validatePricingSettings(merged);

        await updatePricingSettings(
            connection,
            existing.settings_id,
            cleanData
        );

        const [rows] = await connection.execute(
            `SELECT *
             FROM shipping_tax_settings
             WHERE settings_id = ?`,
            [existing.settings_id]
        );

        if (rows.length !== 1) {
            throw new ApiError(
                500,
                "Updated pricing settings could not be retrieved."
            );
        }

        await connection.commit();

        return rows[0];
    } catch (error) {
        try {
            await connection.rollback();
        } catch {
            // Preserve the original error.
        }

        throw error;
    } finally {
        connection.release();
    }
};