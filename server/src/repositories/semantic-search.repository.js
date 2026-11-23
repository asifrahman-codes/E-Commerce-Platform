import { pool } from "../database/index.js";

export async function getExistingProductHashes(productIds) {

    if (!productIds.length) {
        return [];
    }

    const placeholders = productIds
        .map(() => "?")
        .join(", ");

    const [rows] = await pool.execute(
        `
        SELECT product_id, content_hash, model

        FROM semantic_product_embeddings

        WHERE product_id IN (${placeholders})
        `,
        productIds
    );

    return rows;
}

export async function saveProductEmbeddings(products) {

    if (!products.length) {
        return;
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        for (const product of products) {

            await connection.execute(
                `
                INSERT INTO semantic_product_embeddings (
                    product_id,
                    product_text,
                    embedding,
                    product_data,
                    model,
                    content_hash
                )

                VALUES (?, ?, ?, ?, ?, ?)

                ON DUPLICATE KEY UPDATE

                    product_text = VALUES(product_text),
                    embedding = VALUES(embedding),
                    product_data = VALUES(product_data),
                    model = VALUES(model),
                    content_hash = VALUES(content_hash),
                    indexed_at = CURRENT_TIMESTAMP
                `,
                [
                    product.product_id,
                    product.product_text,
                    JSON.stringify(product.embedding),
                    JSON.stringify(product.product_data),
                    product.model,
                    product.content_hash,
                ]
            );
        }

        await connection.commit();

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
}

export async function getAllIndexedProducts() {

    const [rows] = await pool.execute(
        `
        SELECT
            product_id,
            embedding,
            product_data

        FROM semantic_product_embeddings
        `
    );

    return rows;
}

export async function getIndexStatistics() {

    const [rows] = await pool.execute(
        `
        SELECT
            COUNT(*) AS indexed_products,
            MAX(indexed_at) AS last_indexed_at

        FROM semantic_product_embeddings
        `
    );

    return rows[0];
}

export async function updateProductSnapshots(products) {

    if (!products.length) {
        return;
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        for (const product of products) {

            await connection.execute(
                `
                UPDATE semantic_product_embeddings

                SET product_data = ?

                WHERE product_id = ?
                `,
                [
                    JSON.stringify(product),
                    product.product_id,
                ]
            );
        }

        await connection.commit();

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
}