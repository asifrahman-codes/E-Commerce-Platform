import api from "./api";
import API_ENDPOINTS from "./endpoints";

const payload = (response) => response?.data ?? response;

export const getAddresses = async () =>
  payload(await api.get(API_ENDPOINTS.ADDRESSES.BASE)) || [];

export const createAddress = async (data) =>
  payload(await api.post(API_ENDPOINTS.ADDRESSES.BASE, data));

export const updateAddress = async (id, data) =>
  payload(await api.patch(API_ENDPOINTS.ADDRESSES.DETAILS(id), data));

export const setDefaultAddress = async (id) =>
  payload(await api.patch(API_ENDPOINTS.ADDRESSES.DEFAULT(id)));

export const deleteAddress = async (id) =>
  api.delete(API_ENDPOINTS.ADDRESSES.DETAILS(id));
