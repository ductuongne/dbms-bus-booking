import { createContext } from 'react'
import { jwtDecode } from 'jwt-decode'
import type { AuthUser, DecodedToken, UserRole } from '../types/auth'
import { TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from '../lib/api'

export interface AuthContextType {
	user: AuthUser | null
	token: string | null
	role: UserRole | null
	isAuthenticated: boolean
	isInitialized: boolean
	login: (token: string, explicitUser?: AuthUser, refreshToken?: string) => void
	logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function decodeTokenSafely(token: string): DecodedToken | null {
	try {
		const decoded = jwtDecode<DecodedToken>(token)
		// exp tính theo giây, so sánh với Date.now() tính theo mili-giây
		if (decoded.exp && decoded.exp * 1000 < Date.now()) {
			localStorage.removeItem(TOKEN_STORAGE_KEY)
			localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
			return null
		}
		return decoded
	} catch {
		localStorage.removeItem(TOKEN_STORAGE_KEY)
		localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
		return null
	}
}

