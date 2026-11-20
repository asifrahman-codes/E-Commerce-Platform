import { query } from "../database/index.js";

const toPositiveInt = (value, fallback, max = Number.MAX_SAFE_INTEGER) => {
    const number = Number.parseInt(value, 10);

    if (!Number.isInteger(number) || number < 1) {
        return fallback;
    }

    return Math.min(number, max);
};

export const findAllAdminProducts = async ({
    search = "",
    status = "",
    category_id = null,
    page = 1,
    limit = 10
}) => {
    const safeLimit = toPositiveInt(limit, 10, 50);
    const safePage = toPositiveInt(page, 1);
    const offset = (safePage - 1) * safeLimit;

    const conditions = [];
    const params = [];

    if (search) {
        conditions.push(`
            (
                p.name LIKE ?
                OR p.slug LIKE ?
                OR b.name LIKE ?
            )
        `);

        const value = `%${search}%`;

        params.push(value, value, value);
    }

    if (status) {
        conditions.push("p.status = ?");
        params.push(status);
    }

    if (category_id) {
        conditions.push("p.category_id = ?");
        params.push(category_id);
    }

    const where = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const countRows = await query(
        `
        SELECT COUNT(*) AS total
        FROM products p
        LEFT JOIN brands b ON b.brand_id = p.brand_id
        ${where}
        `,
        params
    );

    const products = await query(
        `
        SELECT
            p.product_id,
            p.category_id,
            p.brand_id,
            p.name,
            p.slug,
            p.description,
            p.base_price,
            p.status,
            p.created_at,
            p.updated_at,
            c.name AS category_name,
            b.name AS brand_name,
            (
                SELECT pi.image_url
                FROM product_images pi
                WHERE pi.product_id = p.product_id
                ORDER BY pi.is_primary DESC, pi.image_id ASC
                LIMIT 1
            ) AS image_url,
            (
                SELECT COUNT(*)
                FROM product_variants pv
                WHERE pv.product_id = p.product_id
            ) AS variant_count,
            (
                SELECT COALESCE(SUM(pv.stock), 0)
                FROM product_variants pv
                WHERE pv.product_id = p.product_id
                AND pv.status = 'ACTIVE'
            ) AS total_stock
        FROM products p
        LEFT JOIN categories c ON c.category_id = p.category_id
        LEFT JOIN brands b ON b.brand_id = p.brand_id
        ${where}
        ORDER BY p.created_at DESC
        LIMIT ${safeLimit} OFFSET ${offset}
        `,
        params
    );

    const total = Number(countRows[0].total);

    return {
        items: products,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit)
        }
    };
};

export const findAdminProductById = async (productId) => {
    const products = await query(
        `
        SELECT
            p.*,
            c.name AS category_name,
            b.name AS brand_name
        FROM products p
        LEFT JOIN categories c ON c.category_id = p.category_id
        LEFT JOIN brands b ON b.brand_id = p.brand_id
        WHERE p.product_id = ?
        LIMIT 1
        `,
        [productId]
    );

    return products[0] || null;
};

export const createAdminProduct = async (data) => {
    const result = await query(
        `
        INSERT INTO products (
            category_id,
            brand_id,
            name,
            slug,
            description,
            base_price,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            data.category_id,
            data.brand_id,
            data.name,
            data.slug,
            data.description,
            data.base_price,
            data.status || "ACTIVE"
        ]
    );

    return result.insertId;
};

export const updateAdminProduct = async (productId, data) => {
    const result = await query(
        `
        UPDATE products
        SET
            category_id = ?,
            brand_id = ?,
            name = ?,
            slug = ?,
            description = ?,
            base_price = ?,
            status = ?
        WHERE product_id = ?
        `,
        [
            data.category_id,
            data.brand_id,
            data.name,
            data.slug,
            data.description,
            data.base_price,
            data.status,
            productId
        ]
    );

    return result.affectedRows;
};

export const updateAdminProductStatus = async (productId, status) => {
    const result = await query(
        `
        UPDATE products
        SET status = ?
        WHERE product_id = ?
        `,
        [status, productId]
    );

    return result.affectedRows;
};

export const findProductVariantsForAdmin = async (productId) => {
    return query(
        `
        SELECT
            variant_id,
            product_id,
            sku,
            size,
            color,
            price_adjustment,
            stock,
            status
        FROM product_variants
        WHERE product_id = ?
        ORDER BY variant_id DESC
        `,
        [productId]
    );
};

export const findProductImagesForAdmin = async (productId) => {
    return query(
        `
        SELECT
            image_id,
            product_id,
            image_url,
            public_id,
            is_primary
        FROM product_images
        WHERE product_id = ?
        ORDER BY is_primary DESC, image_id ASC
        `,
        [productId]
    );
};