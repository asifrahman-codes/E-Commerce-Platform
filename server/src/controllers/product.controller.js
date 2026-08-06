import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {

    createProductService,

    getAllProductsService,

    getProductByIdService,

    updateProductService,

    deleteProductService

} from "../services/product.service.js";

/*
|--------------------------------------------------------------------------
| Create Product
|--------------------------------------------------------------------------
*/

export const createProduct = asyncHandler(

    async (req, res) => {

        const product = await createProductService(req.body);

        return res
            .status(201)
            .json(

                new ApiResponse(

                    201,

                    "Product created successfully",

                    product

                )

            );

    }

);

/*
|--------------------------------------------------------------------------
| Get All Products
|--------------------------------------------------------------------------
*/

export const getAllProducts = asyncHandler(

    async (req, res) => {

        const products = await getAllProductsService();

        return res
            .status(200)
            .json(

                new ApiResponse(

                    200,

                    "Products fetched successfully",

                    products

                )

            );

    }

);

/*
|--------------------------------------------------------------------------
| Get Product By ID
|--------------------------------------------------------------------------
*/

export const getProductById = asyncHandler(

    async (req, res) => {

        const product = await getProductByIdService(

            req.params.id

        );

        return res
            .status(200)
            .json(

                new ApiResponse(

                    200,

                    "Product fetched successfully",

                    product

                )

            );

    }

);

/*
|--------------------------------------------------------------------------
| Update Product
|--------------------------------------------------------------------------
*/

export const updateProduct = asyncHandler(

    async (req, res) => {

        const product = await updateProductService(

            req.params.id,

            req.body

        );

        return res
            .status(200)
            .json(

                new ApiResponse(

                    200,

                    "Product updated successfully",

                    product

                )

            );

    }

);

/*
|--------------------------------------------------------------------------
| Delete Product
|--------------------------------------------------------------------------
*/

export const deleteProduct = asyncHandler(

    async (req, res) => {

        await deleteProductService(

            req.params.id

        );

        return res
            .status(200)
            .json(

                new ApiResponse(

                    200,

                    "Product deleted successfully",

                    null

                )

            );

    }

);