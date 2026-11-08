import api from "./api";
import API_ENDPOINTS from "./endpoints";

export const getCategories = async () => {
  const response = await api.get(
    API_ENDPOINTS.CATEGORIES.BASE
  );

  const payload = response?.data ?? response;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.categories)) {
    return payload.categories;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};