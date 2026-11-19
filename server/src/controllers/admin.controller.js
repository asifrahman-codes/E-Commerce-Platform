import {
    getAdminDashboardService
} from "../services/admin.service.js";


export const getAdminDashboardController = async (
    req,
    res,
    next
) => {

    try {

        const dashboard =
            await getAdminDashboardService();

        return res.status(200).json({

            success: true,

            message:
                "Admin dashboard retrieved successfully",

            data: dashboard

        });

    } catch (error) {

        next(error);

    }

};