import { query } from "../database/index.js";

/*
|--------------------------------------------------------------------------
| Create Product
|--------------------------------------------------------------------------
*/

export const createProduct = async ({
    category_id,
    brand_id,
    name,
    slug,
    description,
    price,
    status
}) => {

    const sql = `
        INSERT INTO products
        (
            category_id,
            brand_id,
            name,
            slug,
            description,
            price,
            status
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )
    `;

    const result = await query(sql, [
        category_id,
        brand_id,
        name,
        slug,
        description,
        price,
        status
    ]);

    return result.insertId;
};

/*
|--------------------------------------------------------------------------
| Find Product By ID
|--------------------------------------------------------------------------
*/

export const findProductById = async (productId) => {

    const sql = `
        SELECT
            p.product_id,
            p.category_id,
            c.name AS category_name,
            p.brand_id,
            b.name AS brand_name,
            p.name,
            p.slug,
            p.description,
            p.price,
            p.status,
            p.created_at
        FROM products p
        INNER JOIN categories c
            ON p.category_id = c.category_id
        INNER JOIN brands b
            ON p.brand_id = b.brand_id
        WHERE p.product_id = ?
        LIMIT 1
    `;

    const products = await query(sql, [productId]);

    return products[0] || null;
};

/*
|--------------------------------------------------------------------------
| Find Product By Slug
|--------------------------------------------------------------------------
*/

export const findProductBySlug = async (slug) => {

    const sql = `
        SELECT
            product_id,
            slug
        FROM products
        WHERE slug = ?
        LIMIT 1
    `;

    const products = await query(sql, [slug]);

    return products[0] || null;
};

/*
|--------------------------------------------------------------------------
| Get All Products
|--------------------------------------------------------------------------
*/

export const getAllProducts = async () => {

    const sql = `
        SELECT
            p.product_id,
            p.name,
            p.slug,
            p.price,
            p.status,
            c.name AS category_name,
            b.name AS brand_name,
            p.created_at
        FROM products p
        INNER JOIN categories c
            ON p.category_id = c.category_id
        INNER JOIN brands b
            ON p.brand_id = b.brand_id
        ORDER BY p.created_at DESC
    `;

    return await query(sql);
};

/*
|--------------------------------------------------------------------------
| Update Product
|--------------------------------------------------------------------------
*/

export const updateProduct = async (
    productId,
    updateData
) => {

    const fields = [];
    const values = [];

    Object.entries(updateData).forEach(([key, value]) => {

        fields.push(`${key} = ?`);
        values.push(value);

    });

    values.push(productId);

    const sql = `
        UPDATE products
        SET ${fields.join(", ")}
        WHERE product_id = ?
    `;

    return await query(sql, values);
};

/*
|--------------------------------------------------------------------------
| Delete Product
|--------------------------------------------------------------------------
*/

export const deleteProduct = async (productId) => {

    const sql = `
        DELETE FROM products
        WHERE product_id = ?
    `;

    return await query(sql, [productId]);
};