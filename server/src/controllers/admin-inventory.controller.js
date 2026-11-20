import * as service from "../services/admin-inventory.service.js";

export const getDashboard = async (req, res, next) => {
    try {
        const data = await service.getInventoryDashboardService();

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

export const getLowStock = async (req, res, next) => {
    try {
        const data = await service.getLowStockService(
            req.query.threshold ?? 5
        );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

export const getHistory = async (req, res, next) => {
    try {
        const data = await service.getInventoryHistoryService(req.query);

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

export const adjustStock = async (req, res, next) => {
    try {
        const data = await service.adjustStockService(req.body);

        return res.status(200).json({
            success: true,
            message: "Inventory updated successfully.",
            data
        });
    } catch (error) {
        next(error);
    }
};