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
import { findCategoryById } from "../repositories/category.repository.js";
import { findBrandById } from "../repositories/brand.repository.js";

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

async function assertActiveCategory(categoryId) {
    const category = await findCategoryById(categoryId);

    if (!category || category.status !== "ACTIVE") {
        throw new ApiError(400, "Invalid or inactive category.");
    }
}

async function assertActiveBrand(brandId) {
    const brand = await findBrandById(brandId);

    if (!brand || brand.status !== "ACTIVE") {
        throw new ApiError(400, "Invalid or inactive brand.");
    }
}

export const getAdminProductsService = async (filters) => {
    const page = Number(filters.page || 1);
    const limit = Number(filters.limit || 10);
    const sort = String(filters.sort || "newest");
    const allowedSorts = new Set([
        "newest",
        "oldest",
        "price_asc",
        "price_desc",
        "name_asc",
        "name_desc"
    ]);

    if (!Number.isInteger(page) || page < 1) {
        throw new ApiError(400, "Invalid page.");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
        throw new ApiError(400, "Limit must be between 1 and 50.");
    }

    if (!allowedSorts.has(sort)) {
        throw new ApiError(400, "Invalid product sort order.");
    }

    return findAllAdminProducts({
        search: String(filters.search || "").trim(),
        status: filters.status || "",
        category_id: filters.category_id || null,
        sort,
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

    await Promise.all([
        assertActiveCategory(data.category_id),
        data.brand_id ? assertActiveBrand(data.brand_id) : Promise.resolve(),
    ]);

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

    await Promise.all([
        assertActiveCategory(data.category_id),
        data.brand_id ? assertActiveBrand(data.brand_id) : Promise.resolve(),
    ]);

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