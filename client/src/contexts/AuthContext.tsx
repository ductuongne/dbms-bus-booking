import React, {
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'
import type { AuthUser } from '../types/auth'
import { TOKEN_STORAGE_KEY } from '../lib/api'
import {
	AuthContext,
	decodeTokenSafely,
	type AuthContextType,
} from './auth.context'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	// Khởi tạo lazy state tức thời từ localStorage khi Mount (F5) không gây cascading re-renders
	const [token, setToken] = useState<string | null>(() => {
		const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
		if (!storedToken) return null
		const decoded = decodeTokenSafely(storedToken)
		return decoded ? storedToken : null
	})

	const [user, setUser] = useState<AuthUser | null>(() => {
		const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
		if (!storedToken) return null
		const decoded = decodeTokenSafely(storedToken)
		return decoded
			? {
					userId: decoded.userId,
					role: decoded.role,
				}
			: null
	})

	const [isInitialized] = useState<boolean>(true)

	// Đăng nhập: Lưu token vào storage, giải mã và cập nhật state
	const login = useCallback((newToken: string, explicitUser?: AuthUser) => {
		localStorage.setItem(TOKEN_STORAGE_KEY, newToken)
		const decoded = decodeTokenSafely(newToken)
		setToken(newToken)
		if (explicitUser) {
			setUser(explicitUser)
		} else if (decoded) {
			setUser({
				userId: decoded.userId,
				role: decoded.role,
			})
		}
	}, [])

	// Đăng xuất: Xóa token khỏi storage, reset state
	const logout = useCallback(() => {
		localStorage.removeItem(TOKEN_STORAGE_KEY)
		setToken(null)
		setUser(null)
	}, [])

	// Lắng nghe sự kiện auth:logout từ Axios Response Interceptor (khi server trả 401)
	useEffect(() => {
		const handleSyncLogout = () => {
			logout()
		}
		window.addEventListener('auth:logout', handleSyncLogout)
		return () => {
			window.removeEventListener('auth:logout', handleSyncLogout)
		}
	}, [logout])

	const role = user?.role ?? null
	const isAuthenticated = Boolean(token && user)

	const contextValue = useMemo<AuthContextType>(
		() => ({
			user,
			token,
			role,
			isAuthenticated,
			isInitialized,
			login,
			logout,
		}),
		[user, token, role, isAuthenticated, isInitialized, login, logout]
	)

	return (
		<AuthContext.Provider value={contextValue}>
			{children}
		</AuthContext.Provider>
	)
}

export default AuthProvider
