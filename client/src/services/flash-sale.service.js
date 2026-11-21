import api from "./api";
import API_ENDPOINTS from "./endpoints";

const payload = (response) => response?.data ?? response;

export const getFlashSales = async () =>
  payload(await api.get(API_ENDPOINTS.FLASH_SALES.BASE));

export const getAdminFlashSales = async () =>
  payload(await api.get(API_ENDPOINTS.FLASH_SALES.ADMIN));

export const createFlashSale = async (campaign) =>
  payload(await api.post(API_ENDPOINTS.FLASH_SALES.ADMIN, campaign));

export const updateFlashSale = async (id, campaign) =>
  payload(await api.patch(API_ENDPOINTS.FLASH_SALES.ADMIN_DETAILS(id), campaign));
