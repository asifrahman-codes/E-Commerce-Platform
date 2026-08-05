import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {

    createCategoryService,

    getAllCategoriesService,

    getCategoryByIdService,

    updateCategoryService,

    deleteCategoryService

} from "../services/category.service.js";

/*
|--------------------------------------------------------------------------
| Create Category
|--------------------------------------------------------------------------
*/

export const createCategory = asyncHandler(

    async (req, res) => {

        const category = await createCategoryService(req.body);

        return res
            .status(201)
            .json(

                new ApiResponse(

                    201,

                    "Category created successfully",

                    category

                )

            );

    }

);

/*
|--------------------------------------------------------------------------
| Get All Categories
|--------------------------------------------------------------------------
*/

export const getAllCategories = asyncHandler(

    async (req, res) => {

        const categories = await getAllCategoriesService();

        return res
            .status(200)
            .json(

                new ApiResponse(

                    200,

                    "Categories fetched successfully",

                    categories

                )

            );

    }

);

/*
|--------------------------------------------------------------------------
| Get Category By ID
|--------------------------------------------------------------------------
*/

export const getCategoryById = asyncHandler(

    async (req, res) => {

        const category = await getCategoryByIdService(

            req.params.id

        );

        return res
            .status(200)
            .json(

                new ApiResponse(

                    200,

                    "Category fetched successfully",

                    category

                )

            );

    }

);

/*
|--------------------------------------------------------------------------
| Update Category
|--------------------------------------------------------------------------
*/

export const updateCategory = asyncHandler(

    async (req, res) => {

        const category = await updateCategoryService(

            req.params.id,

            req.body

        );

        return res
            .status(200)
            .json(

                new ApiResponse(

                    200,

                    "Category updated successfully",

                    category

                )

            );

    }

);

/*
|--------------------------------------------------------------------------
| Delete Category
|--------------------------------------------------------------------------
*/

export const deleteCategory = asyncHandler(

    async (req, res) => {

        await deleteCategoryService(

            req.params.id

        );

        return res
            .status(200)
            .json(

                new ApiResponse(

                    200,

                    "Category deleted successfully",

                    null

                )

            );

    }

);