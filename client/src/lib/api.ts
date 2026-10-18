import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiErrorResponse } from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
export const TOKEN_STORAGE_KEY = 'auth_token'

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000,
})

// Request Interceptor: Tự động tiêm Bearer Token nếu có trong localStorage
api.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = localStorage.getItem(TOKEN_STORAGE_KEY)
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error: unknown) => Promise.reject(error)
)

// Response Interceptor: Xử lý 401 tập trung và kích hoạt đồng bộ phiên
api.interceptors.response.use(
	(response) => response,
	(error: AxiosError<ApiErrorResponse>) => {
		if (error.response) {
			const status = error.response.status
			if (status === 401) {
				localStorage.removeItem(TOKEN_STORAGE_KEY)
				// Phát sự kiện toàn cục để AuthContext đồng bộ về unauthenticated
				window.dispatchEvent(new Event('auth:logout'))
			} else if (status === 403) {
				console.warn('[Security Perimeter] 403 Forbidden: Bạn không có quyền truy cập tài nguyên này.')
			}
		}

		return Promise.reject(error)
	}
)

export default api
