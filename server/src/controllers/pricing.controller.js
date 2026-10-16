import {
    previewPricingService
} from "../services/pricing.service.js";

import {
    getPricingSettingsService,
    updatePricingSettingsService
} from "../services/pricing-admin.service.js";

export const previewPricingController = async (req, res, next) => {
    try {
        const result = await previewPricingService(req.body);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getPricingSettingsController = async (req, res, next) => {
    try {
        const settings = await getPricingSettingsService();

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        next(error);
    }
};

export const updatePricingSettingsController = async (
    req,
    res,
    next
) => {
    try {
        const settings = await updatePricingSettingsService(req.body);

        res.status(200).json({
            success: true,
            message: "Pricing settings updated successfully.",
            data: settings
        });
    } catch (error) {
        next(error);
    }
};