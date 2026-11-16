import axios from "axios";
import { clearSession, getToken } from "./session";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5050" : "http://localhost:5001");

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "Session expired. Please log in again."
    ) {
      clearSession();

      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
