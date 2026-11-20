import ApiError from "../utils/ApiError.js";

import {
    findAllAdminProducts,
    findAdminProductById,
    createAdminProduct,
    updateAdminProduct,
    updateAdminProductStatus,
    findProductVariantsForAdmin,
    findProductImagesForAdmin
} from "../repositories/admin-product.repository.js";

import { query } from "../database/index.js";

function validateId(value, name) {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new ApiError(400, `Invalid ${name}.`);
    }

    return id;
}

function normalizeProduct(input) {
    const name = String(input.name || "").trim();

    const basePrice = Number(input.base_price);

    if (!name || name.length > 200) {
        throw new ApiError(400, "Product name is required.");
    }

    if (!Number.isFinite(basePrice) || basePrice < 0) {
        throw new ApiError(400, "Invalid product price.");
    }

    const slug = String(
        input.slug || name.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
    ).trim();

    if (!slug || slug.length > 150) {
        throw new ApiError(400, "Invalid product slug.");
    }

    if (!["ACTIVE", "INACTIVE"].includes(
        input.status || "ACTIVE"
    )) {
        throw new ApiError(400, "Invalid product status.");
    }

    return {
        category_id: validateId(input.category_id, "category ID"),
        brand_id: input.brand_id
            ? validateId(input.brand_id, "brand ID")
            : null,
        name,
        slug,
        description: input.description?.trim() || null,
        base_price: basePrice,
        status: input.status || "ACTIVE"
    };
}

export const getAdminProductsService = async (filters) => {
    const page = Number(filters.page || 1);
    const limit = Number(filters.limit || 10);

    if (!Number.isInteger(page) || page < 1) {
        throw new ApiError(400, "Invalid page.");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
        throw new ApiError(400, "Limit must be between 1 and 50.");
    }

    return findAllAdminProducts({
        search: String(filters.search || "").trim(),
        status: filters.status || "",
        category_id: filters.category_id || null,
        page,
        limit
    });
};

export const getAdminProductDetailsService = async (productId) => {
    const id = validateId(productId, "product ID");

    const product = await findAdminProductById(id);

    if (!product) {
        throw new ApiError(404, "Product not found.");
    }

    const [variants, images] = await Promise.all([
        findProductVariantsForAdmin(id),
        findProductImagesForAdmin(id)
    ]);

    return {
        ...product,
        variants,
        images
    };
};

export const createAdminProductService = async (input) => {
    const data = normalizeProduct(input);

    const [categories, brands] = await Promise.all([
        query(
            "SELECT category_id FROM categories WHERE category_id = ? AND status = 'ACTIVE'",
            [data.category_id]
        ),
        data.brand_id
            ? query(
                "SELECT brand_id FROM brands WHERE brand_id = ? AND status = 'ACTIVE'",
                [data.brand_id]
            )
            : Promise.resolve([{}])
    ]);

    if (!categories.length) {
        throw new ApiError(400, "Invalid or inactive category.");
    }

    if (!brands.length) {
        throw new ApiError(400, "Invalid or inactive brand.");
    }

    try {
        const productId = await createAdminProduct(data);

        return await getAdminProductDetailsService(productId);
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            throw new ApiError(409, "Product name or slug already exists.");
        }

        throw error;
    }
};

export const updateAdminProductService = async (
    productId,
    input
) => {
    const id = validateId(productId, "product ID");

    const existing = await findAdminProductById(id);

    if (!existing) {
        throw new ApiError(404, "Product not found.");
    }

    const data = normalizeProduct(input);

    const categories = await query(
        "SELECT category_id FROM categories WHERE category_id = ? AND status = 'ACTIVE'",
        [data.category_id]
    );

    if (!categories.length) {
        throw new ApiError(400, "Invalid or inactive category.");
    }

    if (data.brand_id) {
        const brands = await query(
            "SELECT brand_id FROM brands WHERE brand_id = ? AND status = 'ACTIVE'",
            [data.brand_id]
        );

        if (!brands.length) {
            throw new ApiError(400, "Invalid or inactive brand.");
        }
    }

    try {
        await updateAdminProduct(id, data);

        return getAdminProductDetailsService(id);
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            throw new ApiError(409, "Product name or slug already exists.");
        }

        throw error;
    }
};

export const updateAdminProductStatusService = async (
    productId,
    status
) => {
    const id = validateId(productId, "product ID");

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
        throw new ApiError(400, "Invalid product status.");
    }

    const existing = await findAdminProductById(id);

    if (!existing) {
        throw new ApiError(404, "Product not found.");
    }

    await updateAdminProductStatus(id, status);

    return { product_id: id, status };
};