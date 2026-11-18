import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

import {
    getMyAddressesService,
    createMyAddressService,
    updateMyAddressService,
    deleteMyAddressService,
    setMyDefaultAddressService,
} from "../services/address.service.js";

const getUserId = (req) =>
    req.user?.user_id ?? req.user?.id ?? req.user?.userId;

export const getMyAddresses = async (req, res, next) => {
    try {
        const addresses = await getMyAddressesService(getUserId(req));

        return res.status(200).json({
            success: true,
            message: "Addresses fetched successfully",
            data: addresses,
        });
    } catch (error) {
        next(error);
    }
};

export const createMyAddress = async (req, res, next) => {
    try {
        const address = await createMyAddressService(
            getUserId(req),
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Address created successfully",
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

export const updateMyAddress = async (req, res, next) => {
    try {
        const address = await updateMyAddressService(
            req.params.addressId,
            getUserId(req),
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteMyAddress = async (req, res, next) => {
    try {
        await deleteMyAddressService(
            req.params.addressId,
            getUserId(req)
        );

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const setMyDefaultAddress = async (req, res, next) => {
    try {
        const address = await setMyDefaultAddressService(
            req.params.addressId,
            getUserId(req)
        );

        return res.status(200).json({
            success: true,
            message: "Default address updated successfully",
            data: address,
        });
    } catch (error) {
        next(error);
    }
};