import ApiError from "../utils/ApiError.js";

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

};