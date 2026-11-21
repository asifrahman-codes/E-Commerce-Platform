import ApiError from "../utils/ApiError.js";
import withTransaction from "../utils/transaction.js";
import {
    adjustLoyaltyBalance,
    countLoyaltyTransactions,
    createLoyaltyTransaction,
    createPointLot,
    createRedemptionAllocation,
    createRedemptionRestoreLot,
    ensureLoyaltyAccount,
    expirePointLot,
    findEarnedPointLotForOrder,
    findExpiredPointLots,
    findOrderForLoyaltyAward,
    findLoyaltyTransactionByEvent,
    findRedeemablePointLots,
    findRedemptionAllocations,
    findRedemptionForOrder,
    getLoyaltySettings,
    listLoyaltyTransactions,
    reducePointLot,
    restorePointLot,
    updateLoyaltySettings,
    updatePointLotRemaining
} from "../repositories/loyalty.repository.js";

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

function validateSettings(settings) {
    if (
        !Number.isFinite(Number(settings.points_per_currency)) ||
        Number(settings.points_per_currency) <= 0 ||
        !Number.isFinite(Number(settings.currency_per_point)) ||
        Number(settings.currency_per_point) <= 0 ||
        !Number.isSafeInteger(Number(settings.minimum_redemption_points)) ||
        Number(settings.minimum_redemption_points) < 1 ||
        (settings.expiry_days !== null &&
            settings.expiry_days !== undefined &&
            (!Number.isSafeInteger(Number(settings.expiry_days)) ||
                Number(settings.expiry_days) < 1 ||
                Number(settings.expiry_days) > 36500))
    ) {
        throw new ApiError(400, "Invalid loyalty settings.");
    }
}

async function expirePoints(connection, userId) {
    const lots = await findExpiredPointLots(connection, userId);
    let expired = 0;
    for (const lot of lots) {
        expired += await expirePointLot(connection, { ...lot, user_id: userId });
    }
    return expired;
}

async function getAccountSnapshot(
    connection,
    userId,
    lock = true,
    { allowInactive = false } = {}
) {
    await ensureLoyaltyAccount(connection, userId, lock);
    await expirePoints(connection, userId);
    const account = await ensureLoyaltyAccount(connection, userId, lock);
    const settings = await getLoyaltySettings(connection, lock);
    if (!settings || (!allowInactive && settings.status !== "ACTIVE")) {
        throw new ApiError(503, "Loyalty rewards are currently unavailable.");
    }
    return {
        balance: Number(account.balance),
        lifetime_earned: Number(account.lifetime_earned),
        settings
    };
}

export async function getLoyaltyAccountService(userId) {
    return withTransaction(async (connection) => {
        const account = await getAccountSnapshot(connection, userId);
        return {
            balance: account.balance,
            lifetime_earned: account.lifetime_earned,
            points_per_currency: Number(account.settings.points_per_currency),
            currency_per_point: Number(account.settings.currency_per_point),
            minimum_redemption_points: Number(account.settings.minimum_redemption_points),
            expiry_days: account.settings.expiry_days === null
                ? null
                : Number(account.settings.expiry_days)
        };
    });
}

export async function getLoyaltyTransactionsService(userId, { page = 1, limit = 20 } = {}) {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    if (
        !Number.isSafeInteger(parsedPage) || parsedPage < 1 ||
        !Number.isSafeInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100
    ) {
        throw new ApiError(400, "Invalid pagination parameters.");
    }
    const offset = (parsedPage - 1) * parsedLimit;
    if (!Number.isSafeInteger(offset)) {
        throw new ApiError(400, "Invalid pagination parameters.");
    }
    const total = await countLoyaltyTransactions(userId);
    return {
        transactions: await listLoyaltyTransactions(
            userId,
            parsedLimit,
            offset
        ),
        pagination: {
            page: parsedPage,
            limit: parsedLimit,
            total,
            total_pages: Math.ceil(total / parsedLimit)
        }
    };
}

export async function getAdminLoyaltySettingsService() {
    const settings = await getLoyaltySettings();
    if (!settings) throw new ApiError(500, "Loyalty settings are missing.");
    return settings;
}

export async function updateLoyaltySettingsService(data) {
    validateSettings(data);
    return withTransaction(async (connection) => {
        await updateLoyaltySettings(connection, data);
        return getLoyaltySettings(connection);
    });
}

export async function quoteLoyaltyRedemption(
    connection,
    { userId, points, maximumDiscount }
) {
    const requested = Number(points || 0);
    if (requested === 0) return { points: 0, discount: 0 };
    if (!Number.isSafeInteger(requested) || requested < 0) {
        throw new ApiError(400, "Invalid loyalty points.");
    }

    const account = await getAccountSnapshot(connection, userId, true);
    if (requested < Number(account.settings.minimum_redemption_points)) {
        throw new ApiError(
            400,
            `At least ${account.settings.minimum_redemption_points} points are required to redeem.`
        );
    }
    if (requested > account.balance) {
        throw new ApiError(400, "Your loyalty points balance is insufficient.");
    }

    const discount = roundMoney(
        requested * Number(account.settings.currency_per_point)
    );
    if (discount > Number(maximumDiscount)) {
        throw new ApiError(400, "The selected points exceed the eligible merchandise total.");
    }
    return { points: requested, discount };
}

export async function redeemPointsForOrder(
    connection,
    { userId, orderId, points, maximumDiscount }
) {
    const quote = await quoteLoyaltyRedemption(connection, {
        userId,
        points,
        maximumDiscount
    });
    const requested = quote.points;
    if (!requested) return quote;
    const discount = quote.discount;

    const lots = await findRedeemablePointLots(connection, userId);
    let remaining = requested;
    const allocations = [];
    for (const lot of lots) {
        if (remaining === 0) break;
        const allocated = Math.min(remaining, Number(lot.remaining_points));
        await reducePointLot(connection, lot.lot_id, allocated);
        allocations.push({ lotId: lot.lot_id, points: allocated });
        remaining -= allocated;
    }
    if (remaining > 0) {
        throw new ApiError(409, "Your loyalty balance changed. Refresh checkout and try again.");
    }

    const transactionId = await createLoyaltyTransaction(connection, {
        userId,
        orderId,
        type: "REDEEM",
        pointsChange: -requested,
        currencyAmount: discount,
        eventKey: `order:${orderId}:loyalty-redeem`,
        notes: "Points redeemed at checkout"
    });
    for (const allocation of allocations) {
        await createRedemptionAllocation(
            connection,
            transactionId,
            allocation.lotId,
            allocation.points
        );
    }
    await adjustLoyaltyBalance(connection, userId, -requested);
    return { points: requested, discount };
}

export async function awardCompletedOrderPoints(connection, orderId) {
    const order = await findOrderForLoyaltyAward(connection, orderId);
    if (!order || order.status !== "DELIVERED" || order.payment_status !== "PAID") {
        return 0;
    }
    const settings = await getLoyaltySettings(connection, true);
    if (!settings) throw new ApiError(500, "Loyalty settings are missing.");
    if (settings.status !== "ACTIVE") return 0;

    const eventKey = `order:${orderId}:loyalty-earn`;
    if (await findLoyaltyTransactionByEvent(connection, eventKey)) return 0;

    const account = await getAccountSnapshot(connection, order.user_id, true);
    const eligibleSpend = Math.max(
        0,
        Number(order.subtotal) - Number(order.discount)
    );
    const points = Math.floor(
        eligibleSpend * Number(account.settings.points_per_currency) + Number.EPSILON
    );
    if (points <= 0) return 0;

    const transactionId = await createLoyaltyTransaction(connection, {
        userId: order.user_id,
        orderId,
        type: "EARN",
        pointsChange: points,
        currencyAmount: roundMoney(eligibleSpend),
        eventKey,
        notes: "Points earned for a delivered, paid order"
    });
    await createPointLot(connection, {
        transactionId,
        userId: order.user_id,
        points,
        expiryDays: account.settings.expiry_days === null
            ? null
            : Number(account.settings.expiry_days)
    });
    await adjustLoyaltyBalance(connection, order.user_id, points, true);
    return points;
}

export async function restoreRedeemedPointsForOrder(connection, orderId, userId) {
    const redemption = await findRedemptionForOrder(connection, orderId, userId);
    if (!redemption) return 0;
    const eventKey = `order:${orderId}:loyalty-restore`;
    if (await findLoyaltyTransactionByEvent(connection, eventKey)) return 0;

    const account = await getAccountSnapshot(
        connection,
        userId,
        true,
        { allowInactive: true }
    );
    const allocations = await findRedemptionAllocations(
        connection,
        redemption.transaction_id
    );
    const total = allocations.reduce(
        (sum, allocation) => sum + Number(allocation.points_allocated),
        0
    );
    if (!total) return 0;

    const transactionId = await createLoyaltyTransaction(connection, {
        userId,
        orderId,
        type: "REDEEM_RESTORE",
        pointsChange: total,
        currencyAmount: Number(redemption.currency_amount),
        eventKey,
        notes: "Redeemed points restored after cancellation or full refund"
    });

    let expiredPoints = 0;
    for (const allocation of allocations) {
        const expired = allocation.expires_at &&
            new Date(allocation.expires_at).getTime() <= Date.now();
        if (expired) {
            expiredPoints += Number(allocation.points_allocated);
        } else {
            await restorePointLot(
                connection,
                allocation.lot_id,
                Number(allocation.points_allocated)
            );
        }
    }
    if (expiredPoints > 0) {
        await createRedemptionRestoreLot(connection, {
            transactionId,
            userId,
            points: expiredPoints,
            expiryDays: account.settings.expiry_days
        });
    }
    await adjustLoyaltyBalance(connection, userId, total);
    return total;
}

export async function reverseEarnedPointsForOrder(connection, orderId, userId) {
    await getAccountSnapshot(
        connection,
        userId,
        true,
        { allowInactive: true }
    );
    const eventKey = `order:${orderId}:loyalty-reversal`;
    if (await findLoyaltyTransactionByEvent(connection, eventKey)) return 0;
    const lot = await findEarnedPointLotForOrder(connection, orderId, userId);
    if (!lot) return 0;

    const points = Math.max(
        0,
        Number(lot.original_points) - Number(lot.expired_points)
    );
    if (points <= 0) return 0;
    await updatePointLotRemaining(connection, lot.lot_id, 0);
    await createLoyaltyTransaction(connection, {
        userId,
        orderId,
        type: "REVERSAL",
        pointsChange: -points,
        eventKey,
        notes: "Points from the refunded order reversed; spent points create a balance adjustment"
    });
    await adjustLoyaltyBalance(connection, userId, -points);
    return points;
}
