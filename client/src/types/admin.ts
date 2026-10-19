import type { UserRole } from './auth'

export interface AdminUser {
	userId: string
	fullName: string
	email: string
	phone: string
	role: UserRole
	loyaltyPoints: number
	isActive: boolean
}

export interface CreateUserInput {
	fullName: string
	email: string
	phone: string
	password: string
	role: UserRole
}

export interface UpdateUserInput {
	fullName: string
	email: string
	phone: string
	role: UserRole
}
