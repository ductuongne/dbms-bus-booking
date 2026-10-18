export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'DRIVER'

export interface AuthUser {
	userId: string
	role: UserRole
	email?: string
	fullName?: string
	phone?: string
}

export interface DecodedToken {
	userId: string
	role: UserRole
	exp: number
	iat: number
}

export interface ApiErrorResponse {
	success: false
	message: string
	error?: string
	errors?: Record<string, string[]>
}
