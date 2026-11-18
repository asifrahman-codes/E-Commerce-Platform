import ApiError from "../utils/ApiError.js";

import {
    findAddressesByUserId,
    findAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
    clearDefaultAddresses,
    setDefaultAddress,
} from "../repositories/address.repository.js";

const validateAddress = (data) => {
    const requiredFields = [
        "recipient_name",
        "phone",
        "address_line_1",
        "city",
        "country",
    ];

    for (const field of requiredFields) {
        if (!data[field] || !String(data[field]).trim()) {
            throw new ApiError(400, `${field} is required`);
        }
    }
};

export const getMyAddressesService = async (userId) => {
    return findAddressesByUserId(userId);
};

export const createMyAddressService = async (userId, data) => {
    validateAddress(data);

    const existingAddresses = await findAddressesByUserId(userId);

    const isDefault =
        Boolean(data.is_default) || existingAddresses.length === 0;

    if (isDefault) {
        await clearDefaultAddresses(userId);
    }

    return createAddress(userId, {
        ...data,
        is_default: isDefault,
    });
};

export const updateMyAddressService = async (
    addressId,
    userId,
    data
) => {
    const existingAddress = await findAddressById(addressId, userId);

    if (!existingAddress) {
        throw new ApiError(404, "Address not found");
    }

    validateAddress(data);

    return updateAddress(addressId, userId, data);
};

export const deleteMyAddressService = async (
    addressId,
    userId
) => {
    const existingAddress = await findAddressById(addressId, userId);

    if (!existingAddress) {
        throw new ApiError(404, "Address not found");
    }

    await deleteAddress(addressId, userId);

    if (existingAddress.is_default) {
        const remainingAddresses = await findAddressesByUserId(userId);

        if (remainingAddresses.length > 0) {
            await clearDefaultAddresses(userId);

            await setDefaultAddress(
                remainingAddresses[0].address_id,
                userId
            );
        }
    }

    return true;
};

export const setMyDefaultAddressService = async (
    addressId,
    userId
) => {
    const address = await findAddressById(addressId, userId);

    if (!address) {
        throw new ApiError(404, "Address not found");
    }

    await clearDefaultAddresses(userId);
    await setDefaultAddress(addressId, userId);

    return findAddressById(addressId, userId);
};