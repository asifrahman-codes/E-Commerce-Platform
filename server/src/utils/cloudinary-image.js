import { Readable } from "stream";

import cloudinary from "../config/cloudinary.js";
import ApiError from "./ApiError.js";
import { logger } from "./logger.js";

const MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const validateImageFile = (file) => {
    if (!file || !MIME_TYPES.has(file.mimetype)) {
        throw new ApiError(400, "Only JPEG, PNG and WebP images are allowed.");
    }

    const buffer = file.buffer;
    const isJpeg = buffer?.[0] === 0xff && buffer?.[1] === 0xd8 && buffer?.[2] === 0xff;
    const isPng = buffer?.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );
    const isWebp = buffer?.toString("ascii", 0, 4) === "RIFF" &&
        buffer?.toString("ascii", 8, 12) === "WEBP";

    if (
        !buffer ||
        !((file.mimetype === "image/jpeg" && isJpeg) ||
            (file.mimetype === "image/png" && isPng) ||
            (file.mimetype === "image/webp" && isWebp))
    ) {
        throw new ApiError(400, "The selected file is not a valid JPEG, PNG or WebP image.");
    }
};

export const uploadImageBuffer = (buffer, folder) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image" },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result?.secure_url || !result?.public_id) {
                    reject(new Error("Cloudinary did not return an image URL and public ID."));
                    return;
                }

                resolve(result);
            }
        );

        Readable.from(buffer).pipe(stream);
    });

export const deleteCloudinaryImage = async (publicId) => {
    if (!publicId) return;

    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
    });

    if (result?.result !== "ok" && result?.result !== "not found") {
        throw new Error(`Cloudinary did not delete image ${publicId}.`);
    }
};

export const cleanupUploadedImages = async (images, context) => {
    const results = await Promise.allSettled(
        images.map((image) => deleteCloudinaryImage(image.public_id))
    );

    results.forEach((result, index) => {
        if (result.status === "rejected") {
            logger.error("Unable to clean up uploaded Cloudinary image", {
                context,
                publicId: images[index].public_id,
                error: result.reason?.message,
            });
        }
    });
};

export const cleanupReplacedImage = async (publicId, context) => {
    try {
        await deleteCloudinaryImage(publicId);
    } catch (error) {
        logger.error("Unable to clean up replaced Cloudinary image", {
            context,
            publicId,
            error: error.message,
        });
        throw new ApiError(502, "Image was saved, but the previous Cloudinary image could not be removed.");
    }
};
