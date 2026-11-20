import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    getDashboardOverviewService,
    getSalesAnalyticsService,
    getOrderStatusAnalyticsService,
    getTopSellingProductsService,
    getRecentOrdersService,
    getCustomerAnalyticsService
} from "../services/admin-dashboard.service.js";


export const getOverview = asyncHandler(async (req, res) => {

    const data = await getDashboardOverviewService();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Dashboard overview retrieved successfully",
            data
        )
    );

});


export const getSalesAnalytics = asyncHandler(async (req, res) => {

    const days = req.query.days || 7;

    const data = await getSalesAnalyticsService(days);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Sales analytics retrieved successfully",
            data
        )
    );

});


export const getOrderStatusAnalytics = asyncHandler(async (req, res) => {

    const data = await getOrderStatusAnalyticsService();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Order analytics retrieved successfully",
            data
        )
    );

});


export const getTopProducts = asyncHandler(async (req, res) => {

    const limit = req.query.limit || 5;

    const data = await getTopSellingProductsService(limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Top selling products retrieved successfully",
            data
        )
    );

});


export const getRecentOrders = asyncHandler(async (req, res) => {

    const limit = req.query.limit || 10;

    const data = await getRecentOrdersService(limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Recent orders retrieved successfully",
            data
        )
    );

});


export const getCustomers = asyncHandler(async (req, res) => {

    const data = await getCustomerAnalyticsService();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Customer analytics retrieved successfully",
            data
        )
    );

});