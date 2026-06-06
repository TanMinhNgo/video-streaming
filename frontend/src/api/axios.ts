import axios from "axios";
import toast from "react-hot-toast";
import * as Sentry from "@sentry/react";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

type TokenGetter = (options?: { skipCache?: boolean }) => Promise<string | null>;
type RetryableRequestConfig = NonNullable<Parameters<typeof api.request>[0]> & {
  _authRetry?: boolean;
};

let getAuthToken: TokenGetter | null = null;

export const setAuthTokenGetter = (getter: TokenGetter | null) => {
  getAuthToken = getter;
};

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status === 401 && config && !config._authRetry && getAuthToken) {
      config._authRetry = true;
      const token = await getAuthToken({ skipCache: true });

      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
        return api.request(config);
      }
    }

    if (error.response?.status === 401) {
      toast.error("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại");
    }
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
