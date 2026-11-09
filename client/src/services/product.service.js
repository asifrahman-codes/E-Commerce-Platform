import api from "./api";
import API_ENDPOINTS from "./endpoints";

const getPayload = (response) => {
  return response?.data ?? response;
};

const normalizeProducts = (response) => {
  const payload = getPayload(response);

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.products)) {
    return payload.products;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

export const getProducts = async (params = {}) => {
  const response = await api.get(
    API_ENDPOINTS.PRODUCTS.SEARCH,
    { params }
  );

  return {
    products: normalizeProducts(response),
    raw: getPayload(response),
  };
};

export const getFeaturedProducts = async () => {
  const result = await getProducts({
    page: 1,
    limit: 8,
    sort: "rating_desc",
  });

  return result.products;
};

export const getNewArrivals = async () => {
  const result = await getProducts({
    page: 1,
    limit: 8,
    sort: "newest",
  });

  return result.products;
};

export const getProductById = async (id) => {
  const response = await api.get(
    API_ENDPOINTS.PRODUCTS.DETAILS(id)
  );

  return getPayload(response);
};