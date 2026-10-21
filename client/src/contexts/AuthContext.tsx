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

const USER_STORAGE_KEY = 'auth_user'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	// 1. Khôi phục Token từ localStorage khi F5
	const [token, setToken] = useState<string | null>(() => {
		const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
		if (!storedToken) return null
		const decoded = decodeTokenSafely(storedToken)
		return decoded ? storedToken : null
	})

	// 2. Khôi phục đầy đủ User (gồm fullName, phone, email) từ localStorage khi F5
	const [user, setUser] = useState<AuthUser | null>(() => {
		const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
		if (!storedToken) return null

		const decoded = decodeTokenSafely(storedToken)
		if (!decoded) return null

		// Ưu tiên đọc từ auth_user đã lưu trong localStorage
		const storedUser = localStorage.getItem(USER_STORAGE_KEY)
		if (storedUser) {
			try {
				return JSON.parse(storedUser) as AuthUser
			} catch {
				// Nếu lỗi parse thì fallback về dữ liệu decode từ token
			}
		}

		return {
			userId: decoded.userId,
			role: decoded.role,
		}
	})

	const [isInitialized] = useState<boolean>(true)

	// 3. Khi Đăng nhập: Lưu cả token và đối tượng user vào localStorage
	const login = useCallback((newToken: string, explicitUser?: AuthUser, newRefreshToken?: string) => {
		localStorage.setItem(TOKEN_STORAGE_KEY, newToken)
		if (newRefreshToken) {
			localStorage.setItem('refresh_token', newRefreshToken)
		}

		const decoded = decodeTokenSafely(newToken)
		setToken(newToken)

		if (explicitUser) {
			localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(explicitUser))
			setUser(explicitUser)
		} else if (decoded) {
			const fallbackUser: AuthUser = {
				userId: decoded.userId,
				role: decoded.role,
			}
			localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallbackUser))
			setUser(fallbackUser)
		}
	}, [])

	// 4. Khi Đăng xuất: Xóa sạch cả user và token
	const logout = useCallback(() => {
		localStorage.removeItem(TOKEN_STORAGE_KEY)
		localStorage.removeItem('refresh_token')
		localStorage.removeItem(USER_STORAGE_KEY)
		setToken(null)
		setUser(null)
	}, [])

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