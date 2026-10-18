import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { AppError } from '../../utils/app-error.js'
import { driverRepository } from './driver.repository.js'

export const getMySchedule: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// Tuyệt đối không lấy từ req.params, req.body hay req.query để triệt tiêu IDOR
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

export const driverController = {
	getMySchedule,
}
