import { query } from "../database/index.js";
import pool from "../database/connection.js";

export const createProductImages = async (images) => {
    if (!images.length) return [];

    const values = [];
    const placeholders = images.map((image) => {
        values.push(
            image.product_id,
            image.image_url,
            image.public_id,
            image.is_primary ? 1 : 0
        );
        return "(?, ?, ?, ?)";
    });

    await query(
        `
        INSERT INTO product_images
            (product_id, image_url, public_id, is_primary)
        VALUES ${placeholders.join(", ")}
        `,
        values
    );

    return query(
        `
        SELECT *
        FROM product_images
        WHERE public_id IN (${images.map(() => "?").join(", ")})
        ORDER BY is_primary DESC, image_id ASC
        `,
        images.map((image) => image.public_id)
    );
};

export const createProductImage = async (image) => {
    const [created] = await createProductImages([image]);
    return created.image_id;
};

export const getProductImages = async (productId) => query(
    `
    SELECT *
    FROM product_images
    WHERE product_id = ?
    ORDER BY is_primary DESC, image_id ASC
    `,
    [productId]
);

export const findImageById = async (imageId) => {
    const rows = await query(
        `
        SELECT *
        FROM product_images
        WHERE image_id = ?
        LIMIT 1
        `,
        [imageId]
    );

    return rows[0] || null;
};

export const replaceImageAsset = async (imageId, imageUrl, publicId) => {
    const result = await query(
        `
        UPDATE product_images
        SET image_url = ?, public_id = ?
        WHERE image_id = ?
        `,
        [imageUrl, publicId, imageId]
    );

    return result.affectedRows;
};

export const deleteImageAndPromote = async (image) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            "DELETE FROM product_images WHERE image_id = ? AND product_id = ?",
            [image.image_id, image.product_id]
        );

        if (result.affectedRows && Number(image.is_primary) === 1) {
            await connection.execute(
                "UPDATE product_images SET is_primary = 0 WHERE product_id = ?",
                [image.product_id]
            );

            await connection.execute(
                `
                UPDATE product_images
                SET is_primary = 1
                WHERE product_id = ?
                ORDER BY image_id ASC
                LIMIT 1
                `,
                [image.product_id]
            );
        }

        await connection.commit();
        return result.affectedRows;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const setPrimaryImage = async (image) => query(
    `
    UPDATE product_images
    SET is_primary = CASE WHEN image_id = ? THEN 1 ELSE 0 END
    WHERE product_id = ?
    `,
    [image.image_id, image.product_id]
);
