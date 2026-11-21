import ApiError from "../utils/ApiError.js";
import withTransaction from "../utils/transaction.js";
import {
    countCustomerTargetPurchases,
    findActiveProduct,
    findApplicableFlashTargets,
    findExistingTargetsInWindow,
    findFlashSaleForUpdate,
    findFlashSaleTargets,
    hasFlashSaleRedemptionsForCampaign,
    findVariantForSaleTarget,
    insertFlashSale,
    insertFlashSaleRedemption,
    insertFlashSaleTarget,
    listAdminFlashSales,
    listPublicFlashSaleTargets,
    releaseFlashSaleRedemptions,
    replaceFlashSaleTargets,
    updateFlashSale
} from "../repositories/flash-sale.repository.js";
import { lockProductsForUpdate } from "../repositories/inventory.repository.js";

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export function calculateFlashSalePrice(unitPrice, discountType, discountValue) {
    const price = Number(unitPrice);
    const value = Number(discountValue);
    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(value) || value <= 0) {
        throw new ApiError(400, "Invalid flash-sale price.");
    }
    const discount = discountType === "PERCENTAGE"
        ? price * value / 100
        : value;
    return {
        discount: roundMoney(Math.min(price, discount)),
        salePrice: roundMoney(Math.max(0, price - discount))
    };
}

function normalizeDate(value, field) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new ApiError(400, `Invalid ${field}.`);
    }
    return date.toISOString().slice(0, 19).replace("T", " ");
}

function validateCampaignFields(data) {
    if (!String(data.title || "").trim() || String(data.title).length > 160) {
        throw new ApiError(400, "Campaign title is required and must be at most 160 characters.");
    }
    const startsAt = normalizeDate(data.starts_at, "start date");
    const endsAt = normalizeDate(data.ends_at, "end date");
    if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
        throw new ApiError(400, "Campaign end date must be after its start date.");
    }
    if (!["PERCENTAGE", "FIXED"].includes(data.discount_type)) {
        throw new ApiError(400, "Invalid campaign discount type.");
    }
    const discountValue = Number(data.discount_value);
    if (
        !Number.isFinite(discountValue) ||
        discountValue <= 0 ||
        (data.discount_type === "PERCENTAGE" && discountValue > 100)
    ) {
        throw new ApiError(400, "Invalid campaign discount value.");
    }
    if (!["ACTIVE", "INACTIVE"].includes(data.status ?? "ACTIVE")) {
        throw new ApiError(400, "Invalid campaign status.");
    }
    return {
        ...data,
        title: String(data.title).trim(),
        description: data.description ? String(data.description).trim() : null,
        starts_at: startsAt,
        ends_at: endsAt,
        discount_value: discountValue,
        status: data.status ?? "ACTIVE"
    };
}

async function normalizeTargets(connection, targets) {
    if (!Array.isArray(targets) || targets.length === 0 || targets.length > 100) {
        throw new ApiError(400, "A campaign must target between 1 and 100 products or variants.");
    }
    const normalized = [];
    const seen = new Set();
    for (const target of targets) {
        const limit = target.per_customer_limit == null
            ? null
            : Number(target.per_customer_limit);
        if (
            limit !== null &&
            (!Number.isSafeInteger(limit) || limit < 1)
        ) {
            throw new ApiError(400, "Per-customer purchase limits must be positive whole numbers.");
        }

        if (target.variant_id !== undefined && target.variant_id !== null) {
            const variantId = Number(target.variant_id);
            if (!Number.isSafeInteger(variantId) || variantId <= 0) {
                throw new ApiError(400, "Invalid variant ID.");
            }
            const variant = await findVariantForSaleTarget(connection, variantId);
            if (!variant) throw new ApiError(404, `Active variant ${variantId} was not found.`);
            if (
                target.product_id !== undefined &&
                Number(target.product_id) !== Number(variant.product_id)
            ) {
                throw new ApiError(400, "Variant does not belong to the supplied product.");
            }
            const key = `VARIANT:${variantId}`;
            if (seen.has(key)) throw new ApiError(400, "Duplicate campaign target.");
            seen.add(key);
            normalized.push({
                target_type: "VARIANT",
                product_id: Number(variant.product_id),
                variant_id: variantId,
                per_customer_limit: limit
            });
        } else {
            const productId = Number(target.product_id);
            if (!Number.isSafeInteger(productId) || productId <= 0) {
                throw new ApiError(400, "A valid product ID or variant ID is required.");
            }
            if (!await findActiveProduct(connection, productId)) {
                throw new ApiError(404, `Active product ${productId} was not found.`);
            }
            const key = `PRODUCT:${productId}`;
            if (seen.has(key)) throw new ApiError(400, "Duplicate campaign target.");
            seen.add(key);
            normalized.push({
                target_type: "PRODUCT",
                product_id: productId,
                variant_id: null,
                per_customer_limit: limit
            });
        }
    }

    for (const productId of new Set(normalized.map((target) => target.product_id))) {
        const hasProduct = normalized.some(
            (target) => target.product_id === productId && target.target_type === "PRODUCT"
        );
        const hasVariant = normalized.some(
            (target) => target.product_id === productId && target.target_type === "VARIANT"
        );
        if (hasProduct && hasVariant) {
            throw new ApiError(400, "A product-wide target cannot be combined with variant targets for that product.");
        }
    }
    return normalized;
}

function targetsOverlap(candidate, existing) {
    if (candidate.product_id !== Number(existing.product_id)) return false;
    if (candidate.target_type === "PRODUCT" || existing.target_type === "PRODUCT") {
        return true;
    }
    return Number(candidate.variant_id) === Number(existing.variant_id);
}

async function validateNoOverlappingCampaign(
    connection,
    data,
    targets,
    excludeSaleId = null
) {
    if (data.status !== "ACTIVE") return;
    await lockProductsForUpdate(
        connection,
        [...new Set(targets.map((target) => target.product_id))].sort((a, b) => a - b)
    );
    const existing = await findExistingTargetsInWindow(
        connection,
        data.starts_at,
        data.ends_at,
        excludeSaleId
    );
    if (targets.some((candidate) => existing.some((target) => targetsOverlap(candidate, target)))) {
        throw new ApiError(409, "An active campaign already targets this product or variant during that time.");
    }
}

export async function listFlashSalesService() {
    const rows = await listPublicFlashSaleTargets();
    const campaigns = new Map();
    for (const row of rows) {
        if (!campaigns.has(row.flash_sale_id)) {
            campaigns.set(row.flash_sale_id, {
                flash_sale_id: row.flash_sale_id,
                title: row.title,
                description: row.description,
                starts_at: row.starts_at,
                ends_at: row.ends_at,
                discount_type: row.discount_type,
                discount_value: Number(row.discount_value),
                products: []
            });
        }
        const originalPrice = Number(row.base_price) + Number(row.price_adjustment || 0);
        const { discount, salePrice } = calculateFlashSalePrice(
            originalPrice,
            row.discount_type,
            row.discount_value
        );
        campaigns.get(row.flash_sale_id).products.push({
            target_id: row.target_id,
            target_type: row.target_type,
            product_id: row.product_id,
            product_name: row.product_name,
            slug: row.slug,
            description: row.product_description,
            category_id: row.category_id,
            brand_id: row.brand_id,
            variant_id: row.variant_id,
            sku: row.sku,
            size: row.size,
            color: row.color,
            stock: Number(row.stock),
            image_url: row.image_url,
            original_price: roundMoney(originalPrice),
            discount,
            sale_price: salePrice,
            per_customer_limit: row.per_customer_limit
        });
    }
    return [...campaigns.values()];
}

export async function listAdminFlashSalesService() {
    const campaigns = await listAdminFlashSales();
    return campaigns.map((campaign) => {
        const targets = new Map();
        for (const row of campaign.targets) {
            if (!targets.has(row.target_id)) {
                targets.set(row.target_id, {
                    target_id: row.target_id,
                    target_type: row.target_type,
                    product_id: row.product_id,
                    variant_id: row.variant_id,
                    product_name: row.product_name,
                    sku: row.sku,
                    per_customer_limit: row.per_customer_limit,
                    price_preview: []
                });
            }
            if (row.preview_variant_id && row.variant_status === "ACTIVE") {
                const originalPrice = Number(row.base_price) + Number(row.price_adjustment || 0);
                const { discount, salePrice } = calculateFlashSalePrice(
                    originalPrice,
                    campaign.discount_type,
                    campaign.discount_value
                );
                targets.get(row.target_id).price_preview.push({
                    variant_id: row.preview_variant_id,
                    sku: row.sku,
                    stock: Number(row.stock),
                    original_price: roundMoney(originalPrice),
                    discount,
                    sale_price: salePrice
                });
            }
        }
        return { ...campaign, targets: [...targets.values()] };
    });
}

export async function createFlashSaleService(data, adminId) {
    const normalizedData = validateCampaignFields(data);
    return withTransaction(async (connection) => {
        const targets = await normalizeTargets(connection, data.targets);
        await validateNoOverlappingCampaign(connection, normalizedData, targets);
        const saleId = await insertFlashSale(connection, {
            ...normalizedData,
            created_by: adminId
        });
        for (const target of targets) {
            await insertFlashSaleTarget(connection, saleId, target);
        }
        return { flash_sale_id: saleId, ...normalizedData, targets };
    });
}

export async function updateFlashSaleService(saleId, data) {
    const id = Number(saleId);
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new ApiError(400, "Invalid flash-sale ID.");
    }
    const normalizedData = validateCampaignFields(data);
    return withTransaction(async (connection) => {
        const initial = await findFlashSaleForUpdate(connection, id, false);
        if (!initial) throw new ApiError(404, "Flash sale not found.");
        const initialTargets = await findFlashSaleTargets(connection, id, false);
        const requestedTargets = data.targets === undefined
            ? null
            : await normalizeTargets(connection, data.targets);
        const productIds = [
            ...initialTargets.map((target) => Number(target.product_id)),
            ...(requestedTargets ?? []).map((target) => target.product_id)
        ];
        await lockProductsForUpdate(connection, productIds);

        const existing = await findFlashSaleForUpdate(connection, id);
        if (!existing) throw new ApiError(404, "Flash sale not found.");
        const existingTargets = await findFlashSaleTargets(connection, id);
        const lockedProductIds = new Set(productIds.map(Number));
        if (existingTargets.some((target) => !lockedProductIds.has(Number(target.product_id)))) {
            throw new ApiError(
                409,
                "Campaign targets changed during this update. Reload the campaign and try again."
            );
        }
        const targets = requestedTargets ?? existingTargets;

        if (data.targets !== undefined) {
            if (await hasFlashSaleRedemptionsForCampaign(connection, id)) {
                throw new ApiError(409, "Campaign targets cannot be changed after a sale has been used.");
            }
        }

        await validateNoOverlappingCampaign(connection, normalizedData, targets, id);
        await updateFlashSale(connection, id, normalizedData);
        if (data.targets !== undefined) {
            await replaceFlashSaleTargets(connection, id, targets);
        }
        return { flash_sale_id: id, ...normalizedData, targets };
    });
}

export async function resolveFlashSalesForItems(
    connection,
    items,
    userId,
    { lock = false } = {}
) {
    const resolved = [];
    const pendingByTarget = new Map();
    for (const item of items) {
        const productId = Number(item.product_id);
        const variantId = Number(item.variant_id);
        const matches = await findApplicableFlashTargets(
            connection,
            productId,
            variantId,
            lock
        );
        if (matches.length > 1) {
            throw new ApiError(409, "More than one flash sale applies to a cart item.");
        }
        const target = matches[0] ?? null;
        if (!target) {
            resolved.push({ item, target: null, unitPrice: Number(item.product_price) + Number(item.price_adjustment || 0), discount: 0 });
            continue;
        }
        if (userId && target.per_customer_limit !== null) {
            const previous = await countCustomerTargetPurchases(
                connection,
                target.target_id,
                userId
            );
            const pending = pendingByTarget.get(Number(target.target_id)) || 0;
            if (
                previous + pending + Number(item.quantity) >
                Number(target.per_customer_limit)
            ) {
                throw new ApiError(400, `The per-customer limit for ${target.title} has been reached.`);
            }
            pendingByTarget.set(
                Number(target.target_id),
                pending + Number(item.quantity)
            );
        }
        const originalPrice = Number(item.product_price) + Number(item.price_adjustment || 0);
        const { salePrice, discount } = calculateFlashSalePrice(
            originalPrice,
            target.discount_type,
            target.discount_value
        );
        resolved.push({ item, target, unitPrice: salePrice, discount: roundMoney(discount * Number(item.quantity)) });
    }
    return {
        items: resolved,
        discount: roundMoney(resolved.reduce((sum, item) => sum + item.discount, 0)),
        has_flash_sale: resolved.some((item) => item.target !== null)
    };
}

export async function recordFlashSaleRedemptions(connection, saleItems, userId, orderId) {
    const quantities = new Map();
    for (const saleItem of saleItems) {
        if (!saleItem.target) continue;
        const targetId = Number(saleItem.target.target_id);
        quantities.set(
            targetId,
            (quantities.get(targetId) || 0) + Number(saleItem.item.quantity)
        );
    }
    for (const [targetId, quantity] of quantities) {
        const saleItem = saleItems.find(
            (entry) => Number(entry.target?.target_id) === targetId
        );
        await insertFlashSaleRedemption(connection, {
            targetId,
            userId,
            orderId,
            quantity,
            discountAmount: saleItems
                .filter((saleItem) => Number(saleItem.target?.target_id) === targetId)
                .reduce((sum, saleItem) => sum + Number(saleItem.discount), 0),
            discountType: saleItem.target.discount_type,
            discountValue: saleItem.target.discount_value
        });
    }
}

export async function releaseFlashSaleUsageForOrder(connection, orderId) {
    return releaseFlashSaleRedemptions(connection, orderId);
}
