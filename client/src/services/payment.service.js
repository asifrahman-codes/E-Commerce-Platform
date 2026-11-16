import api from "./api";
import API_ENDPOINTS from "./endpoints";

const payload = (response) => response?.data ?? response;

export const payWithCod = async (orderId) =>
  payload(await api.post(API_ENDPOINTS.PAYMENTS.COD(orderId), { method: "COD" }));

export const startOnlinePayment = async (orderId) =>
  payload(await api.post(API_ENDPOINTS.PAYMENTS.ONLINE_CHECKOUT(orderId), {}));

export const getOnlineAttempt = async (attemptId) =>
  payload(await api.get(API_ENDPOINTS.PAYMENTS.ONLINE_ATTEMPT(attemptId)));

// Existing development-only mock gateway.
export const completeMockPayment = async (attemptId, status) =>
  payload(
    await api.post(API_ENDPOINTS.PAYMENTS.MOCK_COMPLETE(attemptId), { status })
  );
