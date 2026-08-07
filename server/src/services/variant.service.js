import ApiError from "../utils/ApiError.js";

import {
    createVariant,
    findVariantById,
    findVariantBySku,
    findVariantByCombination,
    findVariantsByProduct,
    updateVariant,
    deleteVariant
} from "../repositories/variant.repository.js";

import {
    findProductById
} from "../repositories/product.repository.js";


export const createVariantService = async (variantData) => {

    const {
        product_id,
        sku,
        size,
        color,
        price_adjustment = 0,
        stock = 0,
        status = "ACTIVE"
    } = variantData;


    const product = await findProductById(product_id);

    if (!product) {
        throw new ApiError(
            404,
            "Product not found"
        );
    }


    const existingSku = await findVariantBySku(sku);

    if (existingSku) {
        throw new ApiError(
            409,
            "A variant with this SKU already exists"
        );
    }


    const existingCombination =
        await findVariantByCombination(
            product_id,
            size,
            color
        );

    if (existingCombination) {
        throw new ApiError(
            409,
            "A variant with this size and color already exists for this product"
        );
    }


    const variantId = await createVariant({
        product_id,
        sku,
        size,
        color,
        price_adjustment,
        stock,
        status
    });


    return await findVariantById(variantId);
};

export const getVariantByIdService = async (variantId) => {

    const variant = await findVariantById(variantId);

    if (!variant) {

        throw new ApiError(
            404,
            "Variant not found"
        );

    }

    return variant;

};



export const getVariantsByProductService = async (productId) => {


    const product = await findProductById(productId);

    if (!product) {

        throw new ApiError(
            404,
            "Product not found"
        );

    }

    const variants = await findVariantsByProduct(productId);

    return variants.map((variant) => ({

        ...variant,

        final_price:
            Number(variant.product_price) +
            Number(variant.price_adjustment)

    }));

};


export const updateVariantService = async (
    variantId,
    updateData
) => {

    const existingVariant = await findVariantById(variantId);

    if (!existingVariant) {

        throw new ApiError(
            404,
            "Variant not found"
        );

    }


    if (
        updateData.sku &&
        updateData.sku !== existingVariant.sku
    ) {

        const existingSku =
            await findVariantBySku(updateData.sku);

        if (existingSku) {

            throw new ApiError(
                409,
                "A variant with this SKU already exists"
            );

        }

    }

    /*
|--------------------------------------------------------------------------
| Check Product + Size + Color Combination
|--------------------------------------------------------------------------
*/

const newSize =
    updateData.size !== undefined
        ? updateData.size
        : existingVariant.size;

const newColor =
    updateData.color !== undefined
        ? updateData.color
        : existingVariant.color;


const existingCombination =
    await findVariantByCombination(
        existingVariant.product_id,
        newSize,
        newColor
    );


if (
    existingCombination &&
    existingCombination.variant_id !== Number(variantId)
) {

    throw new ApiError(
        409,
        "A variant with this size and color already exists for this product"
    );

}


    await updateVariant(
        variantId,
        updateData
    );


    const updatedVariant =
        await findVariantById(variantId);

    return {

        ...updatedVariant,

        final_price:
            Number(updatedVariant.product_price) +
            Number(updatedVariant.price_adjustment)

    };

};


export const deleteVariantService = async (variantId) => {

    const variant = await findVariantById(variantId);

    if (!variant) {

        throw new ApiError(
            404,
            "Variant not found"
        );

    }

    await deleteVariant(variantId);


    return null;

};