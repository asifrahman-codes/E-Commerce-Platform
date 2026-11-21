import {
    getAdminLoyaltySettingsService,
    getLoyaltyAccountService,
    getLoyaltyTransactionsService,
    updateLoyaltySettingsService
} from "../services/loyalty.service.js";

export async function getLoyaltyAccountController(req, res, next) {
    try {
        const account = await getLoyaltyAccountService(req.user.user_id);
        res.status(200).json({ success: true, data: account });
    } catch (error) {
        next(error);
    }
}

export async function getLoyaltyTransactionsController(req, res, next) {
    try {
        const result = await getLoyaltyTransactionsService(
            req.user.user_id,
            req.query
        );
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

export async function getAdminLoyaltySettingsController(req, res, next) {
    try {
        const settings = await getAdminLoyaltySettingsService();
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
}

export async function updateAdminLoyaltySettingsController(req, res, next) {
    try {
        const settings = await updateLoyaltySettingsService(req.body);
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
}
