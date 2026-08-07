import { query } from "../database/index.js";

/*
|--------------------------------------------------------------------------
| Save Image
|--------------------------------------------------------------------------
*/

export const createProductImage = async ({
    product_id,
    image_url,
    public_id,
    is_primary
}) => {

    const sql = `
        INSERT INTO product_images
        (
            product_id,
            image_url,
            public_id,
            is_primary
        )
        VALUES
        (?, ?, ?, ?)
    `;

    const result = await query(sql, [
        product_id,
        image_url,
        public_id,
        is_primary
    ]);

    return result.insertId;
};

/*
|--------------------------------------------------------------------------
| Get Images
|--------------------------------------------------------------------------
*/

export const getProductImages = async (productId) => {

    const sql = `
        SELECT *
        FROM product_images
        WHERE product_id=?
        ORDER BY is_primary DESC,image_id ASC
    `;

    return await query(sql,[productId]);
};

/*
|--------------------------------------------------------------------------
| Find Image
|--------------------------------------------------------------------------
*/

export const findImageById = async(imageId)=>{

    const sql=`
        SELECT *
        FROM product_images
        WHERE image_id=?
        LIMIT 1
    `;

    const rows=await query(sql,[imageId]);

    return rows[0] || null;

};

/*
|--------------------------------------------------------------------------
| Delete Image
|--------------------------------------------------------------------------
*/

export const deleteImage = async(imageId)=>{

    const sql=`
        DELETE FROM product_images
        WHERE image_id=?
    `;

    return await query(sql,[imageId]);

};

/*
|--------------------------------------------------------------------------
| Remove Primary
|--------------------------------------------------------------------------
*/

export const clearPrimaryImage = async(productId)=>{

    const sql=`
        UPDATE product_images
        SET is_primary=0
        WHERE product_id=?
    `;

    return await query(sql,[productId]);

};

/*
|--------------------------------------------------------------------------
| Set Primary
|--------------------------------------------------------------------------
*/

export const setPrimaryImage = async(imageId)=>{

    const sql=`
        UPDATE product_images
        SET is_primary=1
        WHERE image_id=?
    `;

    return await query(sql,[imageId]);

};