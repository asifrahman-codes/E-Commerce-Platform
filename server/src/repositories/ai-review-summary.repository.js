import {pool} from "../database/index.js";


export async function getCachedSummary(productId) {
    const [rows] = await pool.execute(
        `
        SELECT
            review_count,
            last_review_at,
            summary,
            generated_at

        FROM ai_product_review_summaries

        WHERE product_id = ?

        LIMIT 1
        `,
        [productId]
    );

    return rows[0] || null;
}

export async function saveSummary(
    productId,
    {
        reviewCount,
        lastReviewAt,
        summary,
    }
) {
    await pool.execute(
        `
        INSERT INTO ai_product_review_summaries (
            product_id,
            review_count,
            last_review_at,
            summary
        )

        VALUES (?, ?, ?, ?)

        ON DUPLICATE KEY UPDATE

            review_count = VALUES(review_count),
            last_review_at = VALUES(last_review_at),
            summary = VALUES(summary),
            generated_at = CURRENT_TIMESTAMP
        `,
        [
            productId,
            reviewCount,
            lastReviewAt,
            JSON.stringify(summary),
        ]
    );
}

export async function deleteCachedSummary(productId) {
    await pool.execute(
        `DELETE FROM ai_product_review_summaries WHERE product_id = ?`,
        [productId]
    );
}