import { query } from "../database/index.js";

/*
|--------------------------------------------------------------------------
| Create Variant
|--------------------------------------------------------------------------
*/

export const createVariant = async ({
    product_id,
    sku,
    size,
    color,
    price_adjustment,
    stock,
    status
}) => {

    const sql = `
        INSERT INTO product_variants
        (
            product_id,
            sku,
            size,
            color,
            price_adjustment,
            stock,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
        product_id,
        sku,
        size,
        color,
        price_adjustment,
        stock,
        status
    ]);

    return result.insertId;
};


/*
|--------------------------------------------------------------------------
| Find Variant By ID
|--------------------------------------------------------------------------
*/

export const findVariantById = async (variantId) => {

    const sql = `
        SELECT
            pv.variant_id,
            pv.product_id,
            pv.sku,
            pv.size,
            pv.color,
            pv.price_adjustment,
            pv.stock,
            pv.status,
            pv.created_at,
            pv.updated_at,

            p.name AS product_name,
            p.slug AS product_slug,
            p.base_price AS product_price

        FROM product_variants pv

        INNER JOIN products p
            ON p.product_id = pv.product_id

        WHERE pv.variant_id = ?

        LIMIT 1
    `;

    const rows = await query(sql, [variantId]);

    return rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Find Variant By SKU
|--------------------------------------------------------------------------
*/

export const findVariantBySku = async (sku) => {

    const sql = `
        SELECT
            pv.variant_id,
            pv.product_id,
            pv.sku,
            pv.size,
            pv.color,
            pv.price_adjustment,
            pv.stock,
            pv.status,
            pv.created_at,
            pv.updated_at

        FROM product_variants pv

        WHERE pv.sku = ?

        LIMIT 1
    `;

    const rows = await query(sql, [sku]);

    return rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Find Variants By Product
|--------------------------------------------------------------------------
*/

export const findVariantsByProduct = async (productId) => {

    const sql = `
        SELECT
            pv.variant_id,
            pv.product_id,
            pv.sku,
            pv.size,
            pv.color,
            pv.price_adjustment,
            pv.stock,
            pv.status,
            pv.created_at,
            pv.updated_at,

            p.name AS product_name,
            p.slug AS product_slug,
            p.base_price AS product_price

        FROM product_variants pv

        INNER JOIN products p
            ON p.product_id = pv.product_id

        WHERE pv.product_id = ?

        ORDER BY pv.variant_id DESC
    `;

    return await query(sql, [productId]);
};


/*
|--------------------------------------------------------------------------
| Update Variant
|--------------------------------------------------------------------------
*/

export const updateVariant = async (
    variantId,
    {
        sku,
        size,
        color,
        price_adjustment,
        stock,
        status
    }
) => {

    const fields = [];
    const values = [];

    if (sku !== undefined) {
        fields.push("sku = ?");
        values.push(sku);
    }

    if (size !== undefined) {
        fields.push("size = ?");
        values.push(size);
    }

    if (color !== undefined) {
        fields.push("color = ?");
        values.push(color);
    }

    if (price_adjustment !== undefined) {
        fields.push("price_adjustment = ?");
        values.push(price_adjustment);
    }

    if (stock !== undefined) {
        fields.push("stock = ?");
        values.push(stock);
    }

    if (status !== undefined) {
        fields.push("status = ?");
        values.push(status);
    }

    if (fields.length === 0) {
        return null;
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");

    const sql = `
        UPDATE product_variants
        SET ${fields.join(", ")}
        WHERE variant_id = ?
    `;

    values.push(variantId);

    return await query(sql, values);
};


/*
|--------------------------------------------------------------------------
| Delete Variant
|--------------------------------------------------------------------------
*/

export const deleteVariant = async (variantId) => {

    const sql = `
        DELETE FROM product_variants
        WHERE variant_id = ?
    `;

    return await query(sql, [variantId]);
};

/*
|--------------------------------------------------------------------------
| Find Variant By Product + Size + Color
|--------------------------------------------------------------------------
*/

export const findVariantByCombination = async (
    productId,
    size,
    color
) => {

    const sql = `
        SELECT
            variant_id,
            product_id,
            sku,
            size,
            color,
            price_adjustment,
            stock,
            status,
            created_at,
            updated_at

        FROM product_variants

        WHERE product_id = ?
          AND size = ?
          AND color = ?

        LIMIT 1
    `;

    const rows = await query(sql, [
        productId,
        size,
        color
    ]);

    return rows[0] || null;
};