import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {

    createBrandService,

    getAllBrandsService,

    getBrandByIdService,

    updateBrandService,

    deleteBrandService

} from "../services/brand.service.js";

/*
|--------------------------------------------------------------------------
| Create Brand
|--------------------------------------------------------------------------
*/

export const createBrand = asyncHandler(

    async (req, res) => {

        const brand = await createBrandService(req.body);

        return res
            .status(201)
            .json(

                new ApiResponse(

                    201,

                    "Brand created successfully",

                    brand

                )

            );

    }

);

/*
|--------------------------------------------------------------------------
| Get All Brands
|--------------------------------------------------------------------------
*/

export const getAllBrands = asyncHandler(

    async (req, res) => {

        const brands = await getAllBrandsService();

        return res
            .status(200)
            .json(

                new ApiResponse(

                    200,

                    "Brands fetched successfully",

                    brands

                )

            );

    }

);

/*
|--------------------------------------------------------------------------
| Get Brand By ID
|--------------------------------------------------------------------------
*/

export const getBrandById = asyncHandler(

    async (req, res) => {

        const brand = await getBrandByIdService(

            req.params.id

        );

        return res
            .status(200)
            .json(

                new ApiResponse(

                    200,

                    "Brand fetched successfully",

                    brand

                )

            );

    }

);

/*
|--------------------------------------------------------------------------
| Update Brand
|--------------------------------------------------------------------------
*/

export const updateBrand = asyncHandler(

    async (req, res) => {

        const brand = await updateBrandService(

            req.params.id,

            req.body

        );

        return res
            .status(200)
            .json(

                new ApiResponse(

                    200,

                    "Brand updated successfully",

                    brand

                )

            );

    }

);

/*
|--------------------------------------------------------------------------
| Delete Brand
|--------------------------------------------------------------------------
*/

export const deleteBrand = asyncHandler(

    async (req, res) => {

        await deleteBrandService(

            req.params.id

        );

        return res
            .status(200)
            .json(

                new ApiResponse(

                    200,

                    "Brand deleted successfully",

                    null

                )

            );

    }

);