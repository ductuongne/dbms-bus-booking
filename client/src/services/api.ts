import { AxiosError } from 'axios';
import apiAxios from '../lib/api';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function handleApiError(err: unknown): never {
  const axiosErr = err as AxiosError<{ message?: string }>;
  const status = axiosErr.response?.status || 500;
  const message =
    axiosErr.response?.data?.message ||
    (err instanceof Error ? err.message : 'Lỗi kết nối');
  throw new ApiError(status, message, axiosErr.response?.data);
}

export const api = {
  get: async <T>(url: string, params?: Record<string, string | number | undefined>): Promise<T> => {
    try {
      const res = await apiAxios.get<T>(url, { params });
      return res.data;
    } catch (err: unknown) {
      handleApiError(err);
    }
  },

  post: async <T>(url: string, body?: unknown): Promise<T> => {
    try {
      const res = await apiAxios.post<T>(url, body);
      return res.data;
    } catch (err: unknown) {
      handleApiError(err);
    }
  },

  put: async <T>(url: string, body?: unknown): Promise<T> => {
    try {
      const res = await apiAxios.put<T>(url, body);
      return res.data;
    } catch (err: unknown) {
      handleApiError(err);
    }
  },

  patch: async <T>(url: string, body?: unknown): Promise<T> => {
    try {
      const res = await apiAxios.patch<T>(url, body);
      return res.data;
    } catch (err: unknown) {
      handleApiError(err);
    }
  },

  delete: async <T>(url: string): Promise<T> => {
    try {
      const res = await apiAxios.delete<T>(url);
      return res.data;
    } catch (err: unknown) {
      handleApiError(err);
    }
  },
};


export default api;

