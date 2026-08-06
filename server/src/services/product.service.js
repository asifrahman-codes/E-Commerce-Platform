import ApiError from "../utils/ApiError.js";
import generateSlug from "../utils/generateSlug.js";

import {
    createProduct,
    findProductById,
    findProductBySlug,
    getAllProducts,
    updateProduct,
    deleteProduct
} from "../repositories/product.repository.js";

import { findCategoryById } from "../repositories/category.repository.js";
import { findBrandById } from "../repositories/brand.repository.js";

/*
|--------------------------------------------------------------------------
| Create Product
|--------------------------------------------------------------------------
*/

export const createProductService = async (data) => {

    const category = await findCategoryById(data.category_id);

    if (!category) {

        throw new ApiError(
            404,
            "Category not found"
        );

    }

    const brand = await findBrandById(data.brand_id);

    if (!brand) {

        throw new ApiError(
            404,
            "Brand not found"
        );

    }

    const slug = generateSlug(data.name);

    const existingProduct = await findProductBySlug(slug);

    if (existingProduct) {

        throw new ApiError(
            409,
            "Product already exists"
        );

    }

    const productId = await createProduct({
        ...data,
        slug
    });

    return await findProductById(productId);

};

/*
|--------------------------------------------------------------------------
| Get All Products
|--------------------------------------------------------------------------
*/

export const getAllProductsService = async () => {

    return await getAllProducts();

};

/*
|--------------------------------------------------------------------------
| Get Product By ID
|--------------------------------------------------------------------------
*/

export const getProductByIdService = async (productId) => {

    const product = await findProductById(productId);

    if (!product) {

        throw new ApiError(
            404,
            "Product not found"
        );

    }

    return product;

};

/*
|--------------------------------------------------------------------------
| Update Product
|--------------------------------------------------------------------------
*/

export const updateProductService = async (
    productId,
    data
) => {

    const product = await findProductById(productId);

    if (!product) {

        throw new ApiError(
            404,
            "Product not found"
        );

    }

    if (data.category_id) {

        const category = await findCategoryById(data.category_id);

        if (!category) {

            throw new ApiError(
                404,
                "Category not found"
            );

        }

    }

    if (data.brand_id) {

        const brand = await findBrandById(data.brand_id);

        if (!brand) {

            throw new ApiError(
                404,
                "Brand not found"
            );

        }

    }

    if (data.name) {

        const slug = generateSlug(data.name);

        const existingProduct = await findProductBySlug(slug);

        if (
            existingProduct &&
            existingProduct.product_id !== Number(productId)
        ) {

            throw new ApiError(
                409,
                "Product already exists"
            );

        }

        data.slug = slug;

    }

    await updateProduct(
        productId,
        data
    );

    return await findProductById(productId);

};

/*
|--------------------------------------------------------------------------
| Delete Product
|--------------------------------------------------------------------------
*/

export const deleteProductService = async (productId) => {

    const product = await findProductById(productId);

    if (!product) {

        throw new ApiError(
            404,
            "Product not found"
        );

    }

    await deleteProduct(productId);

};