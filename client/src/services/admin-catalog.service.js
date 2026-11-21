import api from "./api";
import API_ENDPOINTS from "./endpoints";
import { clearCachedRequests } from "./request-cache";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

const list = (value, key) => {
  const data = unwrap(value);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const adminCatalogService = {
  getCategories: async () => list(
    await api.get(API_ENDPOINTS.CATEGORIES.BASE),
    "categories"
  ),
  createCategory: async (data) => {
    const result = unwrap(await api.post(API_ENDPOINTS.CATEGORIES.BASE, data));
    clearCachedRequests("catalog:categories");
    return result;
  },
  updateCategory: async (id, data) => {
    const result = unwrap(await api.put(API_ENDPOINTS.CATEGORIES.DETAILS(id), data));
    clearCachedRequests("catalog:categories");
    return result;
  },
  deleteCategory: async (id) => {
    const result = unwrap(await api.delete(API_ENDPOINTS.CATEGORIES.DETAILS(id)));
    clearCachedRequests("catalog:categories");
    return result;
  },
  getBrands: async () => list(
    await api.get(API_ENDPOINTS.BRANDS.BASE),
    "brands"
  ),
  createBrand: async (data) => {
    const result = unwrap(await api.post(API_ENDPOINTS.BRANDS.BASE, data));
    clearCachedRequests("catalog:brands");
    return result;
  },
  updateBrand: async (id, data) => {
    const result = unwrap(await api.put(API_ENDPOINTS.BRANDS.DETAILS(id), data));
    clearCachedRequests("catalog:brands");
    return result;
  },
  deleteBrand: async (id) => {
    const result = unwrap(await api.delete(API_ENDPOINTS.BRANDS.DETAILS(id)));
    clearCachedRequests("catalog:brands");
    return result;
  },
};

export default adminCatalogService;
