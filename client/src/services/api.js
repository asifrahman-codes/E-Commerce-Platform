import axios from "axios";
import {
  getStoredToken,
  setStoredToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
  clearStoredTokens,
} from "../utils/auth.utils";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Single in-flight refresh shared by all concurrent 401s.
let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    const refreshToken = getStoredRefreshToken();

    if (!refreshToken) {
      return Promise.reject(new Error("No refresh token"));
    }

    // Plain axios: avoids this instance's interceptors (no refresh loop).
    refreshPromise = axios
      .post(`${import.meta.env.VITE_API_BASE_URL}/token/refresh`, {
        refreshToken,
      })
      .then(({ data }) => {
        const tokens = data?.data ?? data;
        setStoredToken(tokens.accessToken);
        setStoredRefreshToken(tokens.refreshToken);
        return tokens.accessToken;
      })
      .catch((error) => {
        clearStoredTokens();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const AUTH_PATHS = ["/auth/login", "/auth/register", "/token/refresh"];

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    const isAuthCall = AUTH_PATHS.some((path) =>
      original?.url?.includes(path)
    );

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthCall &&
      getStoredRefreshToken()
    ) {
      original._retry = true;

      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        // fall through to the normalized error below
      }
    }

    return Promise.reject({
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
      status: status || 500,
      errors: error.response?.data?.errors || null,
    });
  }
);

export default api;
