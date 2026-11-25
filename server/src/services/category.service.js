import ApiError from "../utils/ApiError.js";
import {
    cleanupReplacedImage,
    cleanupUploadedImages,
    deleteCloudinaryImage,
    uploadImageBuffer,
    validateImageFile
} from "../utils/cloudinary-image.js";

import generateSlug from "../utils/generateSlug.js";

import {

    createCategory,

    findCategoryById,

    findCategoryBySlug,

    getAllCategories,

    updateCategory,

    deleteCategory

} from "../repositories/category.repository.js";

/*
|--------------------------------------------------------------------------
| Create Category
|--------------------------------------------------------------------------
*/

export const createCategoryService = async (data) => {

    const slug = generateSlug(data.name);

    const existingCategory = await findCategoryBySlug(slug);

    if (existingCategory) {

        throw new ApiError(

            409,

            "Category already exists"

        );

    }

    const categoryId = await createCategory({
        ...data,
        slug
    });
    return await findCategoryById(categoryId);
};

/*
|--------------------------------------------------------------------------
| Get All Categories
|--------------------------------------------------------------------------
*/

export const getAllCategoriesService = async () => {

    return await getAllCategories();

};

/*
|--------------------------------------------------------------------------
| Get Category By ID
|--------------------------------------------------------------------------
*/

export const getCategoryByIdService = async (categoryId) => {

    const category = await findCategoryById(categoryId);

    if (!category) {

        throw new ApiError(

            404,

            "Category not found"

        );

    }

    return category;

};

/*
|--------------------------------------------------------------------------
| Update Category
|--------------------------------------------------------------------------
*/

export const updateCategoryService = async (

    categoryId,

    data

) => {

    const category = await findCategoryById(categoryId);

    if (!category) {

        throw new ApiError(

            404,

            "Category not found"

        );

    }

    if (data.name) {

        const slug = generateSlug(data.name);

        const existing = await findCategoryBySlug(slug);

        if (

            existing &&

            existing.category_id !== Number(categoryId)

        ) {

            throw new ApiError(

                409,

                "Category already exists"

            );

        }

        data.slug = slug;

    }

    await updateCategory(

        categoryId,

        data

    );

    return await findCategoryById(categoryId);

};

/*
|--------------------------------------------------------------------------
| Delete Category
|--------------------------------------------------------------------------
*/

export const deleteCategoryService = async (categoryId) => {

    const category = await findCategoryById(categoryId);

    if (!category) {

        throw new ApiError(

            404,

            "Category not found"

        );

    }

    await deleteCategory(categoryId);

    await deleteCloudinaryImage(category.image_public_id);

};

export const uploadCategoryImageService = async (categoryId, file) => {
    const category = await findCategoryById(categoryId);

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    validateImageFile(file);

    const uploaded = await uploadImageBuffer(
        file.buffer,
        "shopsphere/categories"
    );

    try {
        await updateCategory(categoryId, {
            image_url: uploaded.secure_url,
            image_public_id: uploaded.public_id
        });
    } catch (error) {
        await cleanupUploadedImages(
            [uploaded],
            `category:${categoryId}`
        );
        throw error;
    }

    if (category.image_public_id) {
        await cleanupReplacedImage(
            category.image_public_id,
            `category:${categoryId}`
        );
    }

    return findCategoryById(categoryId);
};

export const deleteCategoryImageService = async (categoryId) => {
    const category = await findCategoryById(categoryId);

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    if (!category.image_public_id && !category.image_url) {
        return category;
    }

    await updateCategory(categoryId, {
        image_url: null,
        image_public_id: null
    });

    await deleteCloudinaryImage(category.image_public_id);

    return findCategoryById(categoryId);
};