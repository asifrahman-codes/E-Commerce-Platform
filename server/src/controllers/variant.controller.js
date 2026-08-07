import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    createVariantService,
    getVariantByIdService,
    getVariantsByProductService,
    updateVariantService,
    deleteVariantService
} from "../services/variant.service.js";


/*
|--------------------------------------------------------------------------
| Create Product Variant
|--------------------------------------------------------------------------
*/

export const createVariant = asyncHandler(async (req, res) => {

    const variantData = {
        ...req.body,
        product_id: req.params.productId
    };

    const variant = await createVariantService(variantData);

    return res.status(201).json(
        new ApiResponse(
            201,
            "Product variant created successfully",
            variant
        )
    );

});

/*
|--------------------------------------------------------------------------
| Get Variant By ID
|--------------------------------------------------------------------------
*/

export const getVariantById = asyncHandler(async (req, res) => {

    const variant = await getVariantByIdService(
        req.params.variantId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Product variant fetched successfully",
            variant
        )
    );

});


/*
|--------------------------------------------------------------------------
| Get Variants By Product
|--------------------------------------------------------------------------
*/

export const getVariantsByProduct = asyncHandler(async (req, res) => {

    const variants = await getVariantsByProductService(
        req.params.productId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Product variants fetched successfully",
            variants
        )
    );

});


/*
|--------------------------------------------------------------------------
| Update Product Variant
|--------------------------------------------------------------------------
*/

export const updateVariant = asyncHandler(async (req, res) => {

    const variant = await updateVariantService(
        req.params.variantId,
        req.body
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Product variant updated successfully",
            variant
        )
    );

});


/*
|--------------------------------------------------------------------------
| Delete Product Variant
|--------------------------------------------------------------------------
*/

export const deleteVariant = asyncHandler(async (req, res) => {

    await deleteVariantService(
        req.params.variantId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Product variant deleted successfully",
            null
        )
    );

});