import axios from "axios";
import { getStoredToken } from "../utils/auth.utils";

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

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject({
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",

      status: error.response?.status || 500,

      errors: error.response?.data?.errors || null,
    });
  }
);

export default api;