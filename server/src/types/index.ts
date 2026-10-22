// Vai trò người dùng (Role-Based Access Control)
export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'DRIVER' | 'GUEST'

// Thực thể người dùng từ cơ sở dữ liệu
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

// DTO xác thực và đăng ký tài khoản khách hàng
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

// DTO quản trị người dùng (Admin User Management)
export interface AdminUserResponseDto {
	userId: string
	fullName: string
	email: string
	phone: string
	role: UserRole
	loyaltyPoints: number
	isActive: boolean
}

export interface CreateAdminUserData {
	userId: string
	fullName: string
	email: string
	phone: string
	passwordHash: string
	role: UserRole
}

export interface UpdateAdminUserData {
	fullName: string
	email: string
	phone: string
	role: UserRole
}

// DTO lịch trình và phân công tài xế
export interface DriverScheduleDto {
	tripId: string
	driverId: string
	userId: string
	driverName: string
	driverPhone: string
	licenseNumber: string
	departureTime: Date | string
	arrivalTime: Date | string
	tripStatus: string
	routeId: string
	departureStation: string
	arrivalStation: string
	distanceKm: number
	licensePlate: string
	busType: string
	totalSeats: number
}

