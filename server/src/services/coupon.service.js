import {pool} from "../database/index.js";
import ApiError from "../utils/ApiError.js";

import {
    createCoupon,
    findCouponById,
    findCouponByCode,
    findCouponByCodeForUpdate,
    findCouponByIdForUpdate,
    listCoupons,
    updateCoupon,
    countCouponUsages,
    countUserCouponUsages
} from "../repositories/coupon.repository.js";

async function withTransaction(callback) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const result = await callback(connection);

        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

function roundMoney(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function validateCouponDates(coupon) {
    const now = Date.now();

    if (new Date(coupon.starts_at).getTime() > now) {
        throw new ApiError(400, "Coupon is not active yet.");
    }

    if (new Date(coupon.expires_at).getTime() <= now) {
        throw new ApiError(400, "Coupon has expired.");
    }

    if (coupon.status !== "ACTIVE") {
        throw new ApiError(400, "Coupon is inactive.");
    }
}

function calculateDiscount(coupon, subtotal) {
    const amount = Number(subtotal);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new ApiError(400, "Subtotal must be greater than zero.");
    }

    if (amount < Number(coupon.min_order_amount)) {
        throw new ApiError(
            400,
            `Minimum order amount for this coupon is ${coupon.min_order_amount}.`
        );
    }

    let discount;

    if (coupon.discount_type === "PERCENTAGE") {
        discount = amount * Number(coupon.discount_value) / 100;

        if (coupon.max_discount_amount !== null) {
            discount = Math.min(
                discount,
                Number(coupon.max_discount_amount)
            );
        }
    } else {
        discount = Number(coupon.discount_value);
    }

    // A discount must never exceed the eligible subtotal.
    return roundMoney(Math.min(discount, amount));
}

async function validateCouponRecord(
    connection,
    coupon,
    userId,
    subtotal
) {
    if (!coupon) {
        throw new ApiError(404, "Coupon not found.");
    }

    validateCouponDates(coupon);

    const totalUsed = await countCouponUsages(
        connection,
        coupon.coupon_id
    );

    if (
        coupon.usage_limit !== null &&
        totalUsed >= Number(coupon.usage_limit)
    ) {
        throw new ApiError(400, "Coupon usage limit has been reached.");
    }

    const userUsed = await countUserCouponUsages(
        connection,
        coupon.coupon_id,
        userId
    );

    if (userUsed >= Number(coupon.per_user_limit)) {
        throw new ApiError(
            400,
            "You have already reached this coupon's usage limit."
        );
    }

    return calculateDiscount(coupon, subtotal);
}

// Admin: create a coupon.
export async function createCouponService(data) {
    if (
        data.discount_type === "PERCENTAGE" &&
        Number(data.discount_value) > 100
    ) {
        throw new ApiError(400, "Percentage discount cannot exceed 100.");
    }

    return withTransaction(async (connection) => {
        const [existing] = await connection.execute(
            "SELECT coupon_id FROM coupons WHERE code = ? FOR UPDATE",
            [data.code]
        );

        if (existing.length > 0) {
            throw new ApiError(409, "Coupon code already exists.");
        }

        const couponId = await createCoupon(connection, data);

        return findCouponByIdAfterInsert(connection, couponId);
    });
}

async function findCouponByIdAfterInsert(connection, couponId) {
    const [rows] = await connection.execute(
        "SELECT * FROM coupons WHERE coupon_id = ?",
        [couponId]
    );

    return rows[0];
}

// Admin: list all coupons.
export async function listCouponsService() {
    return listCoupons();
}

// Admin: get one coupon.
export async function getCouponService(couponId) {
    const coupon = await findCouponById(couponId);

    if (!coupon) {
        throw new ApiError(404, "Coupon not found.");
    }

    return coupon;
}

// Admin: update coupon configuration.
export async function updateCouponService(couponId, data) {
    return withTransaction(async (connection) => {
        const existing = await findCouponByIdForUpdate(
            connection,
            couponId
        );

        if (!existing) {
            throw new ApiError(404, "Coupon not found.");
        }

        const merged = { ...existing, ...data };

        if (
            merged.discount_type === "PERCENTAGE" &&
            Number(merged.discount_value) > 100
        ) {
            throw new ApiError(400, "Percentage discount cannot exceed 100.");
        }

        if (
            new Date(merged.expires_at).getTime() <=
            new Date(merged.starts_at).getTime()
        ) {
            throw new ApiError(
                400,
                "Coupon expiry must be after its start date."
            );
        }

        if (
            merged.usage_limit !== null &&
            merged.usage_limit !== undefined &&
            Number(merged.usage_limit) < await countCouponUsages(
                connection,
                couponId
            )
        ) {
            throw new ApiError(
                400,
                "Usage limit cannot be lower than the number of existing uses."
            );
        }

        await updateCoupon(connection, couponId, data);

        const [rows] = await connection.execute(
            "SELECT * FROM coupons WHERE coupon_id = ?",
            [couponId]
        );

        return rows[0];
    });
}

// Admin: deactivate a coupon without deleting its history.
export async function deactivateCouponService(couponId) {
    return updateCouponService(couponId, { status: "INACTIVE" });
}

// Customer: validate a coupon without reserving or consuming it.
export async function validateCouponService({
    code,
    userId,
    subtotal
}) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const coupon = await findCouponByCodeForUpdate(connection, code);

        const discount = await validateCouponRecord(
            connection,
            coupon,
            userId,
            subtotal
        );

        await connection.commit();

        return {
            coupon_id: coupon.coupon_id,
            code: coupon.code,
            discount_type: coupon.discount_type,
            subtotal: roundMoney(subtotal),
            discount,
            total_after_discount: roundMoney(Number(subtotal) - discount)
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Used by the order service while its order transaction is open.
export async function validateCouponForOrder(
    connection,
    { code, userId, subtotal }
) {
    const coupon = await findCouponByCodeForUpdate(connection, code);

    const discount = await validateCouponRecord(
        connection,
        coupon,
        userId,
        subtotal
    );

    return {
        coupon,
        discount
    };
}