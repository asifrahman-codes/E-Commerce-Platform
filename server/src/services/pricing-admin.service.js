import pool from "../database/index.js";
import ApiError from "../utils/ApiError.js";

import {
    getActivePricingSettings,
    getPricingSettingsForUpdate,
    updatePricingSettings
} from "../repositories/pricing.repository.js";

export const getPricingSettingsService = async () => {
    return getActivePricingSettings();
};

export const updatePricingSettingsService = async (data) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const existing = await getPricingSettingsForUpdate(connection);

        const merged = {
            ...existing,
            ...data
        };

        if (
            !Number.isFinite(Number(merged.shipping_fee)) ||
            Number(merged.shipping_fee) < 0
        ) {
            throw new ApiError(400, "Shipping fee cannot be negative.");
        }

        if (
            merged.free_shipping_threshold !== null &&
            merged.free_shipping_threshold !== undefined &&
            Number(merged.free_shipping_threshold) < 0
        ) {
            throw new ApiError(
                400,
                "Free shipping threshold cannot be negative."
            );
        }

        if (
            !Number.isFinite(Number(merged.tax_rate)) ||
            Number(merged.tax_rate) < 0 ||
            Number(merged.tax_rate) > 100
        ) {
            throw new ApiError(400, "Tax rate must be between 0 and 100.");
        }

        if (![0, 1, "0", "1"].includes(merged.tax_enabled)) {
            throw new ApiError(400, "tax_enabled must be 0 or 1.");
        }

        await updatePricingSettings(
            connection,
            existing.settings_id,
            data
        );

        const [rows] = await connection.execute(
            `SELECT *
             FROM shipping_tax_settings
             WHERE settings_id = ?`,
            [existing.settings_id]
        );

        await connection.commit();

        return rows[0];
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};