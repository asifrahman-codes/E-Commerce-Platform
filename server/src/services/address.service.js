import ApiError from "../utils/ApiError.js";
import withTransaction from "../utils/transaction.js";

import {
    findAddressesByUser,
    findAddressByUserId,
    lockUserAddresses,
    insertAddress,
    updateAddressFields,
    clearDefaultAddresses,
    markAddressDefault,
    removeAddress,
    findAddressForUser
} from "../repositories/address.repository.js";

const MAX_ADDRESSES_PER_USER = 10;

const normalizePostalCode = (value) => {
    const trimmed = typeof value === "string" ? value.trim() : value;
    return trimmed === "" ? null : trimmed ?? null;
};

export const listAddressesService = async (userId) => {
    return await findAddressesByUser(userId);
};

export const getAddressService = async (addressId, userId) => {

    // Ownership is part of the query: another user's id simply returns 404.
    const address = await findAddressByUserId(addressId, userId);

    if (!address) {
        throw new ApiError(404, "Address not found");
    }

    return address;

};

export const createAddressService = async (userId, data) => {

    const addressId = await withTransaction(async (connection) => {

        const existing = await lockUserAddresses(connection, userId);

        if (existing.length >= MAX_ADDRESSES_PER_USER) {
            throw new ApiError(
                400,
                `You can save a maximum of ${MAX_ADDRESSES_PER_USER} addresses`
            );
        }

        // The first address is always the default.
        const makeDefault = existing.length === 0 || data.is_default === true;

        if (makeDefault) {
            await clearDefaultAddresses(connection, userId);
        }

        return await insertAddress(connection, {
            userId,
            country: data.country,
            city: data.city,
            street: data.street,
            postalCode: normalizePostalCode(data.postal_code),
            isDefault: makeDefault
        });

    });

    return await getAddressService(addressId, userId);

};

export const updateAddressService = async (addressId, userId, data) => {

    await withTransaction(async (connection) => {

        await lockUserAddresses(connection, userId);

        const current = await findAddressForUser(connection, addressId, userId);

        if (!current) {
            throw new ApiError(404, "Address not found");
        }

        const { is_default: isDefault, ...fields } = data;

        if (Object.hasOwn(fields, "postal_code")) {
            fields.postal_code = normalizePostalCode(fields.postal_code);
        }

        await updateAddressFields(connection, addressId, userId, fields);

        if (isDefault === true) {
            await clearDefaultAddresses(connection, userId);
            await markAddressDefault(connection, addressId, userId);
        }

        if (isDefault === false && Number(current.is_default) === 1) {
            throw new ApiError(
                400,
                "Choose another address as default instead of removing the default flag"
            );
        }

    });

    return await getAddressService(addressId, userId);

};

export const setDefaultAddressService = async (addressId, userId) => {

    return await updateAddressService(addressId, userId, { is_default: true });

};

export const deleteAddressService = async (addressId, userId) => {

    await withTransaction(async (connection) => {

        const all = await lockUserAddresses(connection, userId);

        const target = all.find(
            (row) => Number(row.address_id) === Number(addressId)
        );

        if (!target) {
            throw new ApiError(404, "Address not found");
        }

        try {

            await removeAddress(connection, addressId, userId);

        } catch (error) {

            // orders.address_id is ON DELETE RESTRICT.
            if (error?.errno === 1451) {
                throw new ApiError(
                    409,
                    "This address is used by an existing order and cannot be deleted"
                );
            }

            throw error;

        }

        // Promote the newest remaining address if the default was removed.
        if (Number(target.is_default) === 1) {

            const remaining = all
                .filter((row) => Number(row.address_id) !== Number(addressId))
                .sort((a, b) => Number(b.address_id) - Number(a.address_id));

            if (remaining.length > 0) {
                await markAddressDefault(
                    connection,
                    remaining[0].address_id,
                    userId
                );
            }

        }

    });

};
