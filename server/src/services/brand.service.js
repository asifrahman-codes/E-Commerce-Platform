import ApiError from "../utils/ApiError.js";

import generateSlug from "../utils/generateSlug.js";

import {

    createBrand,

    findBrandById,

    findBrandBySlug,

    getAllBrands,

    updateBrand,

    deleteBrand

} from "../repositories/brand.repository.js";

/*
|--------------------------------------------------------------------------
| Create Brand
|--------------------------------------------------------------------------
*/

export const createBrandService = async (data) => {

    const slug = generateSlug(data.name);

    const existingBrand = await findBrandBySlug(slug);

    if (existingBrand) {

        throw new ApiError(

            409,

            "Brand already exists"

        );

    }

    const brandId = await createBrand({

        ...data,

        slug

    });

    return await findBrandById(brandId);

};

/*
|--------------------------------------------------------------------------
| Get All Brands
|--------------------------------------------------------------------------
*/

export const getAllBrandsService = async () => {

    return await getAllBrands();

};

/*
|--------------------------------------------------------------------------
| Get Brand By ID
|--------------------------------------------------------------------------
*/

export const getBrandByIdService = async (brandId) => {

    const brand = await findBrandById(brandId);

    if (!brand) {

        throw new ApiError(

            404,

            "Brand not found"

        );

    }

    return brand;

};

/*
|--------------------------------------------------------------------------
| Update Brand
|--------------------------------------------------------------------------
*/

export const updateBrandService = async (

    brandId,

    data

) => {

    const brand = await findBrandById(brandId);

    if (!brand) {

        throw new ApiError(

            404,

            "Brand not found"

        );

    }

    if (data.name) {

        const slug = generateSlug(data.name);

        const existingBrand = await findBrandBySlug(slug);

        if (

            existingBrand &&

            existingBrand.brand_id !== Number(brandId)

        ) {

            throw new ApiError(

                409,

                "Brand already exists"

            );

        }

        data.slug = slug;

    }

    await updateBrand(

        brandId,

        data

    );

    return await findBrandById(brandId);

};

/*
|--------------------------------------------------------------------------
| Delete Brand
|--------------------------------------------------------------------------
*/

export const deleteBrandService = async (brandId) => {

    const brand = await findBrandById(brandId);

    if (!brand) {

        throw new ApiError(

            404,

            "Brand not found"

        );

    }

    await deleteBrand(brandId);

};