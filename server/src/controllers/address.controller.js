import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

import {
    listAddressesService,
    getAddressService,
    createAddressService,
    updateAddressService,
    setDefaultAddressService,
    deleteAddressService
} from "../services/address.service.js";

const parseId = (value) => {

    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new ApiError(400, "Invalid address ID");
    }

    return id;

};

export const listAddresses = asyncHandler(async (req, res) => {
    const data = await listAddressesService(req.user.user_id);
    return res.status(200).json(new ApiResponse(200, "Addresses retrieved successfully", data));
});

export const getAddress = asyncHandler(async (req, res) => {
    const data = await getAddressService(parseId(req.params.addressId), req.user.user_id);
    return res.status(200).json(new ApiResponse(200, "Address retrieved successfully", data));
});

export const createAddress = asyncHandler(async (req, res) => {
    const data = await createAddressService(req.user.user_id, req.body);
    return res.status(201).json(new ApiResponse(201, "Address created successfully", data));
});

export const updateAddress = asyncHandler(async (req, res) => {
    const data = await updateAddressService(parseId(req.params.addressId), req.user.user_id, req.body);
    return res.status(200).json(new ApiResponse(200, "Address updated successfully", data));
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
    const data = await setDefaultAddressService(parseId(req.params.addressId), req.user.user_id);
    return res.status(200).json(new ApiResponse(200, "Default address updated", data));
});

export const deleteAddress = asyncHandler(async (req, res) => {
    await deleteAddressService(parseId(req.params.addressId), req.user.user_id);
    return res.status(200).json(new ApiResponse(200, "Address deleted successfully"));
});
