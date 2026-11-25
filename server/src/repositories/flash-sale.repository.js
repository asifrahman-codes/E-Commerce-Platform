import { pool } from "../database/index.js";

function dateMilliseconds(value) {
    if (value instanceof Date) return value.getTime();
    const text = String(value);
    return new Date(text.includes("T") ? text : `${text.replace(" ", "T")}Z`).getTime();
}

export async function listPublicFlashSaleTargets(connection = pool) {
    const [rows] = await connection.execute(
        `SELECT
            s.flash_sale_id, s.title, s.description, s.starts_at, s.ends_at,
            s.discount_type, s.discount_value,
            t.target_id, t.target_type, t.product_id, t.variant_id,
            t.per_customer_limit,
            p.name AS product_name, p.slug, p.description AS product_description,
            p.base_price, p.category_id, p.brand_id,
            v.sku, v.size, v.color, v.price_adjustment, v.stock,
            (SELECT pi.image_url
             FROM product_images pi
             WHERE pi.product_id = p.product_id
             ORDER BY pi.is_primary DESC, pi.image_id ASC
             LIMIT 1) AS image_url
         FROM flash_sales s
         JOIN flash_sale_targets t ON t.flash_sale_id = s.flash_sale_id
         JOIN products p ON p.product_id = t.product_id
         JOIN product_variants v
           ON v.product_id = p.product_id
          AND (t.target_type = 'PRODUCT' OR v.variant_id = t.variant_id)
         WHERE s.status = 'ACTIVE'
           AND s.ends_at > UTC_TIMESTAMP()
           AND p.status = 'ACTIVE'
           AND v.status = 'ACTIVE'
           AND v.stock > 0
         ORDER BY s.ends_at, s.flash_sale_id, t.target_id, v.variant_id
         LIMIT 500`
    );
    return rows;
}

export async function listAdminFlashSales(connection = pool) {
    const [campaigns] = await connection.execute(
        `SELECT flash_sale_id, title, description, starts_at, ends_at,
                discount_type, discount_value, status, created_at
         FROM flash_sales
         ORDER BY created_at DESC, flash_sale_id DESC`
    );
    if (!campaigns.length) return [];
    const ids = campaigns.map((campaign) => campaign.flash_sale_id);
    const [targets] = await connection.query(
        `SELECT t.target_id, t.flash_sale_id, t.target_type, t.product_id,
                t.variant_id, t.per_customer_limit, p.name AS product_name,
                p.base_price, v.variant_id AS preview_variant_id, v.sku,
                v.price_adjustment, v.status AS variant_status, v.stock
         FROM flash_sale_targets t
         JOIN products p ON p.product_id = t.product_id
         LEFT JOIN product_variants v
           ON v.product_id = p.product_id
          AND (t.target_type = 'PRODUCT' OR v.variant_id = t.variant_id)
         WHERE t.flash_sale_id IN (${ids.map(() => "?").join(",")})
         ORDER BY t.target_id, v.variant_id`,
        ids
    );
    const targetMap = new Map();
    for (const target of targets) {
        if (!targetMap.has(target.flash_sale_id)) {
            targetMap.set(target.flash_sale_id, []);
        }
        targetMap.get(target.flash_sale_id).push(target);
    }
    return campaigns.map((campaign) => ({
        ...campaign,
        effective_status: getEffectiveStatus(campaign),
        targets: targetMap.get(campaign.flash_sale_id) ?? []
    }));
}

function getEffectiveStatus(campaign) {
    if (campaign.status !== "ACTIVE") return "INACTIVE";
    const now = Date.now();
    if (dateMilliseconds(campaign.starts_at) > now) return "SCHEDULED";
    if (dateMilliseconds(campaign.ends_at) <= now) return "EXPIRED";
    return "ACTIVE";
}

export async function findFlashSaleForUpdate(connection, saleId, lock = true) {
    const [rows] = await connection.execute(
        `SELECT * FROM flash_sales WHERE flash_sale_id = ?${lock ? " FOR UPDATE" : ""}`,
        [saleId]
    );
    return rows[0] ?? null;
}

export async function findFlashSaleTargets(connection, saleId, lock = true) {
    const [rows] = await connection.execute(
        `SELECT target_id, target_type, product_id, variant_id, per_customer_limit
         FROM flash_sale_targets
         WHERE flash_sale_id = ?
         ORDER BY target_id
         ${lock ? "FOR UPDATE" : ""}`,
        [saleId]
    );
    return rows;
}

export async function findExistingTargetsInWindow(
    connection,
    startsAt,
    endsAt,
    excludeSaleId = null
) {
    const excludeClause = excludeSaleId === null
        ? ""
        : "AND s.flash_sale_id <> ?";
    const values = excludeSaleId === null
        ? [endsAt, startsAt]
        : [endsAt, startsAt, excludeSaleId];
    const [rows] = await connection.execute(
        `SELECT t.target_type, t.product_id, t.variant_id
         FROM flash_sales s
         JOIN flash_sale_targets t ON t.flash_sale_id = s.flash_sale_id
         WHERE s.status = 'ACTIVE'
           AND s.starts_at < ?
           AND s.ends_at > ?
           ${excludeClause}`,
        values
    );
    return rows;
}

export async function findVariantForSaleTarget(connection, variantId) {
    const [rows] = await connection.execute(
        `SELECT v.variant_id, v.product_id
         FROM product_variants v
         JOIN products p ON p.product_id = v.product_id
         WHERE v.variant_id = ?
           AND v.status = 'ACTIVE'
           AND p.status = 'ACTIVE'`,
        [variantId]
    );
    return rows[0] ?? null;
}

export async function findActiveProduct(connection, productId) {
    const [rows] = await connection.execute(
        `SELECT product_id
         FROM products
         WHERE product_id = ? AND status = 'ACTIVE'`,
        [productId]
    );
    return rows[0] ?? null;
}

export async function insertFlashSale(connection, data) {
    const [result] = await connection.execute(
        `INSERT INTO flash_sales
            (title, description, starts_at, ends_at, discount_type,
             discount_value, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.title, data.description ?? null, data.starts_at, data.ends_at,
            data.discount_type, data.discount_value, data.status ?? "ACTIVE",
            data.created_by
        ]
    );
    return result.insertId;
}

export async function insertFlashSaleTarget(connection, saleId, target) {
    const [result] = await connection.execute(
        `INSERT INTO flash_sale_targets
            (flash_sale_id, target_type, product_id, variant_id, per_customer_limit)
         VALUES (?, ?, ?, ?, ?)`,
        [
            saleId, target.target_type, target.product_id,
            target.variant_id, target.per_customer_limit
        ]
    );
    return result.insertId;
}

export async function replaceFlashSaleTargets(connection, saleId, targets) {
    await connection.execute(
        `DELETE FROM flash_sale_targets WHERE flash_sale_id = ?`,
        [saleId]
    );
    for (const target of targets) {
        await insertFlashSaleTarget(connection, saleId, target);
    }
}

export async function updateFlashSale(connection, saleId, data) {
    await connection.execute(
        `UPDATE flash_sales
         SET title = ?, description = ?, starts_at = ?, ends_at = ?,
             discount_type = ?, discount_value = ?, status = ?
         WHERE flash_sale_id = ?`,
        [
            data.title, data.description ?? null, data.starts_at, data.ends_at,
            data.discount_type, data.discount_value, data.status, saleId
        ]
    );
}

export async function findApplicableFlashTargets(
    connection,
    productId,
    variantId,
    lock = false
) {
    const [rows] = await connection.execute(
        `SELECT
            t.target_id, t.target_type, t.product_id, t.variant_id,
            t.per_customer_limit,
            s.flash_sale_id, s.title, s.discount_type, s.discount_value,
            s.starts_at, s.ends_at
         FROM flash_sale_targets t
         JOIN flash_sales s ON s.flash_sale_id = t.flash_sale_id
         JOIN products p ON p.product_id = t.product_id AND p.status = 'ACTIVE'
         WHERE s.status = 'ACTIVE'
           AND s.starts_at <= UTC_TIMESTAMP()
           AND s.ends_at > UTC_TIMESTAMP()
           AND (
                (t.target_type = 'PRODUCT' AND t.product_id = ?)
                OR (t.target_type = 'VARIANT' AND t.variant_id = ?)
           )
         ORDER BY t.target_id
         LIMIT 2${lock ? " FOR UPDATE" : ""}`,
        [productId, variantId]
    );
    return rows;
}

export async function countCustomerTargetPurchases(
    connection,
    targetId,
    userId
) {
    const [rows] = await connection.execute(
        `SELECT COALESCE(SUM(quantity), 0) AS quantity
         FROM flash_sale_redemptions
         WHERE target_id = ? AND user_id = ? AND status = 'USED'`,
        [targetId, userId]
    );
    return Number(rows[0].quantity);
}

export async function hasFlashSaleRedemptionsForCampaign(
    connection,
    saleId
) {
    const [rows] = await connection.execute(
        `SELECT redemption_id
         FROM flash_sale_redemptions
         WHERE target_id IN (
            SELECT target_id
            FROM flash_sale_targets
            WHERE flash_sale_id = ?
         )
         LIMIT 1`,
        [saleId]
    );

    return rows.length > 0;
}

export async function insertFlashSaleRedemption(
    connection,
    {
        targetId,
        userId,
        orderId,
        quantity,
        discountAmount,
        discountType,
        discountValue
    }
) {
    await connection.execute(
        `INSERT INTO flash_sale_redemptions
            (target_id, user_id, order_id, quantity, discount_amount,
             discount_type, discount_value, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'USED')`,
        [
            targetId, userId, orderId, quantity, discountAmount,
            discountType, discountValue
        ]
    );
}

export async function releaseFlashSaleRedemptions(connection, orderId) {
    await connection.execute(
        `UPDATE flash_sale_redemptions
         SET status = 'RELEASED', released_at = CURRENT_TIMESTAMP
         WHERE order_id = ? AND status = 'USED'`,
        [orderId]
    );
}
