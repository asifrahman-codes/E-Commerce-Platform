import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {

    uploadProductImagesService,

    getProductImagesService,

    deleteProductImageService,

    setPrimaryImageService

} from "../services/productImage.service.js";

/*
|--------------------------------------------------------------------------
| Upload Images
|--------------------------------------------------------------------------
*/

export const uploadProductImages = asyncHandler(

    async (req, res) => {

        const images = await uploadProductImagesService(

            req.params.id,

            req.files

        );

        return res.status(201).json(

            new ApiResponse(

                201,

                "Images uploaded successfully",

                images

            )

        );

    }

);

/*
|--------------------------------------------------------------------------
| Get Product Images
|--------------------------------------------------------------------------
*/

export const getProductImages = asyncHandler(

    async (req, res) => {

        const images = await getProductImagesService(

            req.params.id

        );

        return res.status(200).json(

            new ApiResponse(

                200,

                "Images fetched successfully",

                images

            )

        );

    }

);

/*
|--------------------------------------------------------------------------
| Delete Image
|--------------------------------------------------------------------------
*/

export const deleteProductImage = asyncHandler(

    async (req, res) => {

        await deleteProductImageService(

            req.params.imageId

        );

        return res.status(200).json(

            new ApiResponse(

                200,

                "Image deleted successfully",

                null

            )

        );

    }

);

/*
|--------------------------------------------------------------------------
| Set Primary Image
|--------------------------------------------------------------------------
*/

export const setPrimaryImage = asyncHandler(

    async (req, res) => {

        await setPrimaryImageService(

            req.params.imageId

        );

        return res.status(200).json(

            new ApiResponse(

                200,

                "Primary image updated successfully",

                null

            )

        );

    }

);