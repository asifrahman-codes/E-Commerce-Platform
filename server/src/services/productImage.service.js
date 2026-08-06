import { Readable } from "stream";

import cloudinary from "../config/cloudinary.js";

import ApiError from "../utils/ApiError.js";

import { findProductById } from "../repositories/product.repository.js";

import {

    createProductImage,

    getProductImages,

    findImageById,

    deleteImage,

    clearPrimaryImage,

    setPrimaryImage

} from "../repositories/productImage.repository.js";

/*
|--------------------------------------------------------------------------
| Upload Stream Helper
|--------------------------------------------------------------------------
*/

const uploadToCloudinary = (buffer) => {

    return new Promise((resolve,reject)=>{

        const stream=cloudinary.uploader.upload_stream(

            {
                folder:"ecommerce/products"
            },

            (error,result)=>{

                if(error) return reject(error);

                resolve(result);

            }

        );

        Readable.from(buffer).pipe(stream);

    });

};

/*
|--------------------------------------------------------------------------
| Upload Images
|--------------------------------------------------------------------------
*/

export const uploadProductImagesService = async(productId,files)=>{

    const product=await findProductById(productId);

    if(!product){

        throw new ApiError(404,"Product not found");

    }

    const existingImages=await getProductImages(productId);

    const uploaded=[];

    for(const file of files){

        const result=await uploadToCloudinary(file.buffer);

        const imageId=await createProductImage({

            product_id:productId,

            image_url:result.secure_url,

            public_id:result.public_id,

            is_primary:existingImages.length===0 && uploaded.length===0

        });

        uploaded.push({

            image_id:imageId,

            image_url:result.secure_url,

            public_id:result.public_id

        });

    }

    return uploaded;

};

/*
|--------------------------------------------------------------------------
| Get Images
|--------------------------------------------------------------------------
*/

export const getProductImagesService=async(productId)=>{

    return await getProductImages(productId);

};

/*
|--------------------------------------------------------------------------
| Delete Image
|--------------------------------------------------------------------------
*/

export const deleteProductImageService=async(imageId)=>{

    const image=await findImageById(imageId);

    if(!image){

        throw new ApiError(404,"Image not found");

    }

    await cloudinary.uploader.destroy(image.public_id);

    await deleteImage(imageId);

};

/*
|--------------------------------------------------------------------------
| Set Primary Image
|--------------------------------------------------------------------------
*/

export const setPrimaryImageService=async(imageId)=>{

    const image=await findImageById(imageId);

    if(!image){

        throw new ApiError(404,"Image not found");

    }

    await clearPrimaryImage(image.product_id);

    await setPrimaryImage(imageId);

};