import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { AppError } from '../../utils/app-error.js'
import { driverRepository } from './driver.repository.js'

export const getMySchedule: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?.userId
		if (!userId) {
			throw new AppError(401, 'Vui lòng đăng nhập để truy cập!')
		}

		const schedules = await driverRepository.findSchedulesByUserId(userId)
		res.status(200).json({
			success: true,
			message: 'Lấy lịch phân công tài xế thành công.',
			data: schedules,
		})
	} catch (err: unknown) {
		next(err)
	}
}

export const getTripPassengers: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?.userId
		if (!userId) {
			throw new AppError(401, 'Vui lòng đăng nhập để truy cập!')
		}

		const paramId = req.params['tripId']
		const tripId = Array.isArray(paramId) ? paramId[0] : paramId
		if (!tripId || typeof tripId !== 'string') {
			throw new AppError(400, 'Thiếu mã chuyến xe!')
		}

		const passengers = await driverRepository.findPassengersByTripId(tripId, userId)
		res.status(200).json({
			success: true,
			data: passengers,
		})
	} catch (err: unknown) {
		next(err)
	}
}

export const checkInTicket: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { ticketCode } = req.body as { ticketCode?: string }
		if (!ticketCode || typeof ticketCode !== 'string' || ticketCode.trim() === '') {
			throw new AppError(400, 'Mã vé không được để trống!')
		}

		const checkedTicket = await driverRepository.checkInTicket(ticketCode.trim())
		res.status(200).json({
			success: true,
			message: 'Soát vé thành công!',
			data: checkedTicket,
		})
	} catch (err: unknown) {
		next(err)
	}
}

export const updateTripStatus: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?.userId
		if (!userId) {
			throw new AppError(401, 'Vui lòng đăng nhập để truy cập!')
		}

		const paramId = req.params['tripId']
		const tripId = Array.isArray(paramId) ? paramId[0] : paramId
		const { status } = req.body as { status?: string }

		if (!tripId || typeof tripId !== 'string') {
			throw new AppError(400, 'Thiếu mã chuyến xe!')
		}
		if (status !== 'DEPARTED' && status !== 'COMPLETED') {
			throw new AppError(400, 'Trạng thái chuyển đổi không hợp lệ (chỉ chấp nhận DEPARTED hoặc COMPLETED)!')
		}

		await driverRepository.updateTripStatus(tripId, status, userId)
		res.status(200).json({
			success: true,
			message: `Cập nhật trạng thái chuyến xe thành công (${status === 'DEPARTED' ? 'Đã khởi hành' : 'Đã hoàn thành'}).`,
		})
	} catch (err: unknown) {
		next(err)
	}
}

export const driverController = {
	getMySchedule,
	getTripPassengers,
	checkInTicket,
	updateTripStatus,
}
