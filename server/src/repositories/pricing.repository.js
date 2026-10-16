import pool from "../database/index.js";

export const getActivePricingSettings = async (connection = pool) => {
    const [rows] = await connection.execute(
        `SELECT
            settings_id,
            currency,
            shipping_fee,
            free_shipping_threshold,
            tax_rate,
            tax_enabled,
            status
         FROM shipping_tax_settings
         WHERE status = 'ACTIVE'
         ORDER BY settings_id DESC
         LIMIT 2`
    );

    if (rows.length !== 1) {
        throw new Error(
            "Exactly one active shipping and tax policy is required."
        );
    }

    return rows[0];
};

export const getPricingSettingsForUpdate = async (connection) => {
    const [rows] = await connection.execute(
        `SELECT *
         FROM shipping_tax_settings
         WHERE status = 'ACTIVE'
         ORDER BY settings_id DESC
         LIMIT 2
         FOR UPDATE`
    );

    if (rows.length !== 1) {
        throw new Error(
            "Exactly one active shipping and tax policy is required."
        );
    }

    return rows[0];
};

export const updatePricingSettings = async (
    connection,
    settingsId,
    data
) => {
    const allowedFields = {
        currency: "currency",
        shipping_fee: "shipping_fee",
        free_shipping_threshold: "free_shipping_threshold",
        tax_rate: "tax_rate",
        tax_enabled: "tax_enabled"
    };

    const columns = [];
    const values = [];

    for (const [key, column] of Object.entries(allowedFields)) {
        if (Object.hasOwn(data, key)) {
            columns.push(`${column} = ?`);
            values.push(data[key]);
        }
    }

    if (columns.length === 0) {
        return false;
    }

    values.push(settingsId);

    const [result] = await connection.execute(
        `UPDATE shipping_tax_settings
         SET ${columns.join(", ")}
         WHERE settings_id = ?
           AND status = 'ACTIVE'`,
        values
    );

    return result.affectedRows > 0;
};