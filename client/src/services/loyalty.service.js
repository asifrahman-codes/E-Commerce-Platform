import api from "./api";
import API_ENDPOINTS from "./endpoints";

const payload = (response) => response?.data ?? response;

export const getLoyaltyAccount = async () =>
  payload(await api.get(API_ENDPOINTS.LOYALTY.ACCOUNT));

export const getLoyaltyTransactions = async (page = 1, limit = 20) =>
  payload(await api.get(API_ENDPOINTS.LOYALTY.TRANSACTIONS, {
    params: { page, limit },
  }));

export const getAdminLoyaltySettings = async () =>
  payload(await api.get(API_ENDPOINTS.LOYALTY.ADMIN_SETTINGS));

export const updateAdminLoyaltySettings = async (settings) =>
  payload(await api.patch(API_ENDPOINTS.LOYALTY.ADMIN_SETTINGS, settings));
