import api from "./api";
import API_ENDPOINTS from "./endpoints";

// Normalize the backend response envelope.
const getResponseData = (response) => {
  return response?.data ?? response;
};

// Register customer
export const registerUser = async (userData) => {
  const response = await api.post(
    API_ENDPOINTS.AUTH.REGISTER,
    userData
  );

  return getResponseData(response);
};

// Login customer
export const loginUser = async (credentials) => {
  const response = await api.post(
    API_ENDPOINTS.AUTH.LOGIN,
    credentials
  );

  const result = getResponseData(response);

  return {
    user: result.user,
    token:
      result.accessToken ||
      result.access_token ||
      result.token ||
      null,
  };
};

// Get authenticated user
export const getCurrentUser = async () => {
  const response = await api.get(
    API_ENDPOINTS.AUTH.ME
  );

  const result = getResponseData(response);

  return result.user || result;
};

// Logout
export const logoutUser = async () => {
  return api.post(API_ENDPOINTS.AUTH.LOGOUT);
};