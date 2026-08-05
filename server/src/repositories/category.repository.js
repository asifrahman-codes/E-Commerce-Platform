import { query } from "../database/index.js";

/*
|--------------------------------------------------------------------------
| Create Category
|--------------------------------------------------------------------------
*/

export const createCategory = async ({
    name,
    slug,
    description,
    status
}) => {

    const sql = `
        INSERT INTO categories
        (
            name,
            slug,
            description,
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
        description,
        status
    ]);

    return result.insertId;
};

/*
|--------------------------------------------------------------------------
| Find Category By ID
|--------------------------------------------------------------------------
*/

export const findCategoryById = async (categoryId) => {

    const sql = `
        SELECT *
        FROM categories
        WHERE category_id = ?
        LIMIT 1
    `;

    const categories = await query(sql, [categoryId]);

    return categories[0] || null;
};

/*
|--------------------------------------------------------------------------
| Find Category By Slug
|--------------------------------------------------------------------------
*/

export const findCategoryBySlug = async (slug) => {

    const sql = `
        SELECT *
        FROM categories
        WHERE slug = ?
        LIMIT 1
    `;

    const categories = await query(sql, [slug]);

    return categories[0] || null;
};

/*
|--------------------------------------------------------------------------
| Get All Categories
|--------------------------------------------------------------------------
*/

export const getAllCategories = async () => {

    const sql = `
        SELECT
            category_id,
            name,
            slug,
            description,
            status,
            created_at
        FROM categories
        ORDER BY created_at DESC
    `;

    return await query(sql);
};

/*
|--------------------------------------------------------------------------
| Update Category
|--------------------------------------------------------------------------
*/

export const updateCategory = async (
    categoryId,
    updateData
) => {

    const fields = [];
    const values = [];

    Object.entries(updateData).forEach(([key, value]) => {
        fields.push(`${key} = ?`);
        values.push(value);
    });

    values.push(categoryId);

    const sql = `
        UPDATE categories
        SET ${fields.join(", ")}
        WHERE category_id = ?
    `;

    return await query(sql, values);
};

/*
|--------------------------------------------------------------------------
| Delete Category
|--------------------------------------------------------------------------
*/

export const deleteCategory = async (categoryId) => {

    const sql = `
        DELETE FROM categories
        WHERE category_id = ?
    `;

    return await query(sql, [categoryId]);
};