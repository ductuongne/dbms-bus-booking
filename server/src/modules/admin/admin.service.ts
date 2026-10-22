import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import type { AdminUserResponseDto } from '../../types/index.js'
import { AppError } from '../../utils/app-error.js'
import { adminRepository } from './admin.repository.js'
import type { CreateUserDto, UpdateUserDto } from './admin.schema.js'

export async function listUsers(): Promise<AdminUserResponseDto[]> {
	return await adminRepository.findAll()
}

export async function createUser(
	dto: CreateUserDto
): Promise<AdminUserResponseDto> {
	const userId = `USR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
	const passwordHash = await bcrypt.hash(dto.password, 12)

	await adminRepository.create({
		userId,
		fullName: dto.fullName,
		email: dto.email,
		phone: dto.phone,
		passwordHash,
		role: dto.role,
	})

	const createdUser = await adminRepository.findById(userId)
	if (createdUser === null) {
		throw new AppError(500, 'Lỗi hệ thống khi khởi tạo người dùng!')
	}
	return createdUser
}

export async function updateUser(
	userId: string,
	dto: UpdateUserDto
): Promise<AdminUserResponseDto> {
	await adminRepository.update(userId, {
		fullName: dto.fullName,
		email: dto.email,
		phone: dto.phone,
		role: dto.role,
	})

	const updatedUser = await adminRepository.findById(userId)
	if (updatedUser === null) {
		throw new AppError(404, 'Không tìm thấy người dùng!')
	}
	return updatedUser
}

export async function updateUserStatus(
	userId: string,
	isActive: boolean,
	currentAdminId?: string
): Promise<void> {
	// Ngăn chặn admin tự khóa tài khoản của chính mình (Self-lockout Prevention)
	if (currentAdminId === userId && !isActive) {
		throw new AppError(
			400,
			'Không thể tự vô hiệu hóa tài khoản của chính mình!'
		)
	}

	await adminRepository.updateStatus(userId, isActive)
}

export async function listDrivers(): Promise<
	{
		driverId: string
		userId: string
		fullName: string
		phone: string
		licenseNumber: string
	}[]
> {
	return await adminRepository.listDrivers()
}

export const adminService = {
	listUsers,
	createUser,
	updateUser,
	updateUserStatus,
	listDrivers,
}
