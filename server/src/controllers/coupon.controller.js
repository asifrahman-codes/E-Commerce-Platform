import {
    createCouponService,
    listCouponsService,
    getCouponService,
    updateCouponService,
    deactivateCouponService,
    validateCouponService
} from "../services/coupon.service.js";

function parsePositiveId(value, fieldName) {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        const error = new Error(`Invalid ${fieldName}.`);
        error.statusCode = 400;
        throw error;
    }

    return id;
}

export async function createCouponController(req, res, next) {
    try {
        const coupon = await createCouponService(req.body);

        res.status(201).json({
            success: true,
            message: "Coupon created successfully.",
            data: coupon
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            error.statusCode = 409;
            error.message = "Coupon code already exists.";
        }

        next(error);
    }
}

export async function listCouponsController(req, res, next) {
    try {
        const coupons = await listCouponsService();

        res.status(200).json({
            success: true,
            data: coupons
        });
    } catch (error) {
        next(error);
    }
}

export async function getCouponController(req, res, next) {
    try {
        const couponId = parsePositiveId(
            req.params.couponId,
            "coupon ID"
        );

        const coupon = await getCouponService(couponId);

        res.status(200).json({
            success: true,
            data: coupon
        });
    } catch (error) {
        next(error);
    }
}

export async function updateCouponController(req, res, next) {
    try {
        const couponId = parsePositiveId(
            req.params.couponId,
            "coupon ID"
        );

        const coupon = await updateCouponService(
            couponId,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Coupon updated successfully.",
            data: coupon
        });
    } catch (error) {
        next(error);
    }
}

export async function deactivateCouponController(req, res, next) {
    try {
        const couponId = parsePositiveId(
            req.params.couponId,
            "coupon ID"
        );

        const coupon = await deactivateCouponService(couponId);

        res.status(200).json({
            success: true,
            message: "Coupon deactivated successfully.",
            data: coupon
        });
    } catch (error) {
        next(error);
    }
}

export async function validateCouponController(req, res, next) {
    try {
        const userId = req.user?.user_id;

        if (!userId) {
            const error = new Error("Authenticated user is required.");
            error.statusCode = 401;
            throw error;
        }

        const result = await validateCouponService({
            code: req.body.code,
            userId,
            subtotal: req.body.subtotal
        });

        res.status(200).json({
            success: true,
            message: "Coupon is valid.",
            data: result
        });
    } catch (error) {
        next(error);
    }
}