import api from "./api";
import API_ENDPOINTS from "./endpoints";

const payload = (response) =>
  response?.data?.data ?? response?.data ?? response;

export async function semanticSearchProducts(params) {
  return payload(
    await api.get(API_ENDPOINTS.AI.SEMANTIC_SEARCH, { params })
  );
}