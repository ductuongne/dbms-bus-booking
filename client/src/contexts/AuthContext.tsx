import React, {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import type { AuthUser, DecodedToken, UserRole } from '../types/auth'
import { TOKEN_STORAGE_KEY } from '../lib/api'

export interface AuthContextType {
	user: AuthUser | null
	token: string | null
	role: UserRole | null
	isAuthenticated: boolean
	isInitialized: boolean
	login: (token: string, explicitUser?: AuthUser) => void
	logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function decodeTokenSafely(token: string): DecodedToken | null {
	try {
		const decoded = jwtDecode<DecodedToken>(token)
		// exp tính theo giây, so sánh với Date.now() tính theo mili-giây
		if (decoded.exp && decoded.exp * 1000 < Date.now()) {
			localStorage.removeItem(TOKEN_STORAGE_KEY)
			return null
		}
		return decoded
	} catch {
		localStorage.removeItem(TOKEN_STORAGE_KEY)
		return null
	}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [token, setToken] = useState<string | null>(null)
	const [user, setUser] = useState<AuthUser | null>(null)
	const [isInitialized, setIsInitialized] = useState<boolean>(false)

	// Hydrate State khi Mount (F5): Đọc token bền vững, giải mã tức thì
	useEffect(() => {
		const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
		if (storedToken) {
			const decoded = decodeTokenSafely(storedToken)
			if (decoded) {
				setToken(storedToken)
				setUser({
					userId: decoded.userId,
					role: decoded.role,
				})
			} else {
				setToken(null)
				setUser(null)
			}
		}
		setIsInitialized(true)
	}, [])

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
