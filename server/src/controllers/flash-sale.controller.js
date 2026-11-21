import {
    createFlashSaleService,
    listAdminFlashSalesService,
    listFlashSalesService,
    updateFlashSaleService
} from "../services/flash-sale.service.js";

export async function listFlashSalesController(req, res, next) {
    try {
        const campaigns = await listFlashSalesService();
        res.status(200).json({ success: true, data: campaigns });
    } catch (error) {
        next(error);
    }
}

export async function listAdminFlashSalesController(req, res, next) {
    try {
        const campaigns = await listAdminFlashSalesService();
        res.status(200).json({ success: true, data: campaigns });
    } catch (error) {
        next(error);
    }
}

export async function createFlashSaleController(req, res, next) {
    try {
        const campaign = await createFlashSaleService(
            req.body,
            req.user.user_id
        );
        res.status(201).json({ success: true, data: campaign });
    } catch (error) {
        next(error);
    }
}

export async function updateFlashSaleController(req, res, next) {
    try {
        const campaign = await updateFlashSaleService(
            req.params.saleId,
            req.body
        );
        res.status(200).json({ success: true, data: campaign });
    } catch (error) {
        next(error);
    }
}
