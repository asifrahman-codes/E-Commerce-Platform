import ApiError from "../utils/ApiError.js";
import {
    cleanupReplacedImage,
    cleanupUploadedImages,
    deleteCloudinaryImage,
    uploadImageBuffer,
    validateImageFile
} from "../utils/cloudinary-image.js";
import { deleteProduct } from "../repositories/product.repository.js";
import { findAdminProductById } from "../repositories/admin-product.repository.js";
import {
    createProductImages,
    deleteImageAndPromote,
    findImageById,
    getProductImages,
    replaceImageAsset,
    setPrimaryImage
} from "../repositories/productImage.repository.js";

const MAX_IMAGES_PER_PRODUCT = 10;

const validateId = (value, label) => {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id < 1) {
        throw new ApiError(400, `Invalid ${label}.`);
    }
    return id;
};

export const uploadProductImagesService = async (productId, files = []) => {
    const id = validateId(productId, "product ID");
    const product = await findAdminProductById(id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }
    if (!files.length) {
        throw new ApiError(400, "Select at least one product image.");
    }

    files.forEach(validateImageFile);

    const existingImages = await getProductImages(id);
    if (existingImages.length + files.length > MAX_IMAGES_PER_PRODUCT) {
        throw new ApiError(
            400,
            `A product can have at most ${MAX_IMAGES_PER_PRODUCT} images.`
        );
    }

    const uploaded = [];
    try {
        for (const file of files) {
            const result = await uploadImageBuffer(
                file.buffer,
                "shopsphere/products"
            );
            uploaded.push({
                product_id: id,
                image_url: result.secure_url,
                public_id: result.public_id
            });
        }

        const imagesToCreate = uploaded.map((image, index) => ({
            ...image,
            is_primary: existingImages.length === 0 && index === 0
        }));

        return await createProductImages(imagesToCreate);
    } catch (error) {
        await cleanupUploadedImages(uploaded, `product:${id}`);
        throw error;
    }
};

export const getProductImagesService = async (productId) => {
    const id = validateId(productId, "product ID");
    return getProductImages(id);
};

export const replaceProductImageService = async (imageId, file) => {
    const id = validateId(imageId, "image ID");
    const image = await findImageById(id);

    if (!image) {
        throw new ApiError(404, "Image not found");
    }

    validateImageFile(file);
    const uploaded = await uploadImageBuffer(
        file.buffer,
        "shopsphere/products"
    );

    try {
        const affectedRows = await replaceImageAsset(
            id,
            uploaded.secure_url,
            uploaded.public_id
        );

        if (!affectedRows) {
            throw new ApiError(404, "Image not found");
        }
    } catch (error) {
        await cleanupUploadedImages([uploaded], `product-image:${id}`);
        throw error;
    }

    await cleanupReplacedImage(image.public_id, `product-image:${id}`);
    return findImageById(id);
};

export const deleteProductImageService = async (imageId) => {
    const id = validateId(imageId, "image ID");
    const image = await findImageById(id);

    if (!image) {
        throw new ApiError(404, "Image not found");
    }

    await deleteImageAndPromote(image);
    await deleteCloudinaryImage(image.public_id);
};

export const setPrimaryImageService = async (imageId) => {
    const id = validateId(imageId, "image ID");
    const image = await findImageById(id);

    if (!image) {
        throw new ApiError(404, "Image not found");
    }

    await setPrimaryImage(image);
};

export const deleteProductImagesForDeletedProduct = async (productId) => {
    const id = validateId(productId, "product ID");
    const images = await getProductImages(id);

    await deleteProduct(id);

    const results = await Promise.allSettled(
        images.map((image) => deleteCloudinaryImage(image.public_id))
    );
    const failed = results.filter((result) => result.status === "rejected");

    if (failed.length) {
        throw new ApiError(
            502,
            "Product was deleted, but one or more Cloudinary images could not be removed."
        );
    }
};
