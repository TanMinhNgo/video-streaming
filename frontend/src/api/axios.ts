import axios from "axios";
import toast from "react-hot-toast";
import * as Sentry from "@sentry/react";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      toast.error("Quá nhiều request, thử lại sau");
    }
    if (error.response?.status >= 500) {
      toast.error("Lỗi server, thử lại sau");
      Sentry.captureException(error);
    }
    return Promise.reject(error);
  },
);
