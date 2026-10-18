export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'DRIVER' | 'GUEST'

export interface UserRow {
	user_id: string
	full_name: string
	email: string
	phone: string
	password_hash: string | null
	role: UserRole
	loyalty_points: number
	is_active: boolean
}

export interface RegisterDto {
	fullName: string
	phone: string
	email: string
	password: string
}

export interface CreateCustomerDto {
	userId: string
	fullName: string
	phone: string
	email: string
	passwordHash: string
}

export interface UpdateGuestDto {
	phone: string
	fullName: string
	passwordHash: string
}
