import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiErrorResponse } from '../types/auth'

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL ||
	import.meta.env.VITE_API_URL ||
	'http://localhost:3000/api'

export const TOKEN_STORAGE_KEY = 'auth_token'
export const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token'

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

let isRefreshing = false
let failedQueue: Array<{
	resolve: (token: string) => void
	reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error)
		} else if (token) {
			prom.resolve(token)
		}
	})
	failedQueue = []
}

// Response Interceptor: Tự động refresh token khi nhận mã 401
api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError<ApiErrorResponse>) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

		if (error.response) {
			const status = error.response.status

			// Chỉ kích hoạt refresh nếu lỗi là 401, chưa retry và không phải route login/refresh
			if (
				status === 401 &&
				originalRequest &&
				!originalRequest._retry &&
				!originalRequest.url?.includes('/public/login') &&
				!originalRequest.url?.includes('/public/refresh-token')
			) {
				const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)

				if (!refreshToken) {
					localStorage.removeItem(TOKEN_STORAGE_KEY)
					localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
					window.dispatchEvent(new Event('auth:logout'))
					return Promise.reject(error)
				}

				if (isRefreshing) {
					return new Promise<string>((resolve, reject) => {
						failedQueue.push({ resolve, reject })
					})
						.then((newToken) => {
							if (originalRequest.headers) {
								originalRequest.headers.Authorization = `Bearer ${newToken}`
							}
							return api(originalRequest)
						})
						.catch((err) => Promise.reject(err))
				}

				originalRequest._retry = true
				isRefreshing = true

				try {
					const res = await axios.post(`${API_BASE_URL}/public/refresh-token`, {
						refreshToken,
					})

					const newAccessToken =
						res.data?.accessToken ||
						res.data?.token ||
						res.data?.data?.accessToken ||
						res.data?.data?.token

					if (!newAccessToken) {
						throw new Error('Không nhận được accessToken mới từ máy chủ')
					}

					localStorage.setItem(TOKEN_STORAGE_KEY, newAccessToken)
					if (originalRequest.headers) {
						originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
					}

					processQueue(null, newAccessToken)
					return api(originalRequest)
				} catch (refreshErr) {
					processQueue(refreshErr, null)
					localStorage.removeItem(TOKEN_STORAGE_KEY)
					localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
					window.dispatchEvent(new Event('auth:logout'))
					return Promise.reject(refreshErr)
				} finally {
					isRefreshing = false
				}
			}

			if (status === 403) {
				console.warn('[Security Perimeter] 403 Forbidden: Bạn không có quyền truy cập tài nguyên này.')
			}
		}

		return Promise.reject(error)
	}
)

export default api

