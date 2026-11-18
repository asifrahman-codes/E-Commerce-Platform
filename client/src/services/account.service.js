import api from "./api";

import API_ENDPOINTS from "./endpoints";

const getData = (response) => {
    return response?.data?.data ?? response?.data ?? response;
};

export const getMyProfile = async () => {
    const response = await api.get(API_ENDPOINTS.USERS.ME);

    return getData(response);
};

export const updateMyProfile = async (data) => {
    const response = await api.patch(
        API_ENDPOINTS.USERS.UPDATE_PROFILE,
        data
    );

    return getData(response);
};

export const changeMyPassword = async (data) => {
    const response = await api.patch(
        API_ENDPOINTS.USERS.CHANGE_PASSWORD,
        data
    );

    return getData(response);
};

export const getMyAddresses = async () => {
    const response = await api.get(API_ENDPOINTS.ADDRESSES.BASE);

    return getData(response);
};

export const createAddress = async (data) => {
    const response = await api.post(
        API_ENDPOINTS.ADDRESSES.BASE,
        data
    );

    return getData(response);
};

export const updateAddress = async (id, data) => {
    const response = await api.patch(
        API_ENDPOINTS.ADDRESSES.DETAILS(id),
        data
    );

    return getData(response);
};

export const deleteAddress = async (id) => {
    const response = await api.delete(
        API_ENDPOINTS.ADDRESSES.DETAILS(id)
    );

    return getData(response);
};

export const setDefaultAddress = async (id) => {
    const response = await api.patch(
        API_ENDPOINTS.ADDRESSES.DEFAULT(id)
    );

    return getData(response);
};