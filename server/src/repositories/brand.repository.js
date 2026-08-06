import { query } from "../database/index.js";

/*
|--------------------------------------------------------------------------
| Create Brand
|--------------------------------------------------------------------------
*/

export const createBrand = async ({
    name,
    slug,
    logo,
    status
}) => {

    const sql = `
        INSERT INTO brands
        (
            name,
            slug,
            logo,
            status
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?
        )
    `;

    const result = await query(sql, [
        name,
        slug,
        logo,
        status
    ]);

    return result.insertId;
};

/*
|--------------------------------------------------------------------------
| Find Brand By ID
|--------------------------------------------------------------------------
*/

export const findBrandById = async (brandId) => {

    const sql = `
        SELECT
            brand_id,
            name,
            slug,
            logo,
            status,
            created_at
        FROM brands
        WHERE brand_id = ?
        LIMIT 1
    `;

    const brands = await query(sql, [brandId]);

    return brands[0] || null;
};

/*
|--------------------------------------------------------------------------
| Find Brand By Slug
|--------------------------------------------------------------------------
*/

export const findBrandBySlug = async (slug) => {

    const sql = `
        SELECT
            brand_id,
            name,
            slug,
            logo,
            status,
            created_at
        FROM brands
        WHERE slug = ?
        LIMIT 1
    `;

    const brands = await query(sql, [slug]);

    return brands[0] || null;
};

/*
|--------------------------------------------------------------------------
| Get All Brands
|--------------------------------------------------------------------------
*/

export const getAllBrands = async () => {

    const sql = `
        SELECT
            brand_id,
            name,
            slug,
            logo,
            status,
            created_at
        FROM brands
        ORDER BY created_at DESC
    `;

    return await query(sql);
};

/*
|--------------------------------------------------------------------------
| Update Brand
|--------------------------------------------------------------------------
*/

export const updateBrand = async (
    brandId,
    updateData
) => {

    const fields = [];
    const values = [];

    Object.entries(updateData).forEach(([key, value]) => {

        fields.push(`${key} = ?`);
        values.push(value);

    });

    values.push(brandId);

    const sql = `
        UPDATE brands
        SET ${fields.join(", ")}
        WHERE brand_id = ?
    `;

    return await query(sql, values);
};

/*
|--------------------------------------------------------------------------
| Delete Brand
|--------------------------------------------------------------------------
*/

export const deleteBrand = async (brandId) => {

    const sql = `
        DELETE FROM brands
        WHERE brand_id = ?
    `;

    return await query(sql, [brandId]);
};