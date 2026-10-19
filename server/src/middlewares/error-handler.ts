import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/app-error.js'

export { AppError }

const SQL_ERROR_MAP: Record<
	number,
	{ statusCode: number; defaultMessage: string }
> = {
	50010: { statusCode: 404, defaultMessage: 'Dữ liệu không tồn tại' },
	50020: { statusCode: 409, defaultMessage: 'Ghế không thuộc xe' },
	50021: { statusCode: 409, defaultMessage: 'Xe bị trùng lịch' },
	50022: { statusCode: 409, defaultMessage: 'Tài xế bị trùng lịch' },
	50023: {
		statusCode: 409,
		defaultMessage: 'Vé khác chuyến trong cùng booking',
	},
	50030: { statusCode: 409, defaultMessage: 'Ghế đã được giữ hoặc đã bán' },
	50031: {
		statusCode: 409,
		defaultMessage: 'Ghế đã được đặt bởi người khác',
	},
	50040: {
		statusCode: 404,
		defaultMessage:
			'Booking không tồn tại hoặc thông tin xác thực không đúng',
	},
	50041: { statusCode: 409, defaultMessage: 'Trạng thái booking không hợp lệ' },
	50042: { statusCode: 410, defaultMessage: 'Booking đã hết hạn giữ chỗ' },
	50050: {
		statusCode: 409,
		defaultMessage: 'Không thể hủy booking không ở trạng thái giữ chỗ',
	},
	50060: { statusCode: 422, defaultMessage: 'Chuyến đi không khả dụng' },
	50061: { statusCode: 400, defaultMessage: 'Dữ liệu đặt vé không hợp lệ' },
	50062: { statusCode: 422, defaultMessage: 'Khách hàng không tồn tại' },
	50070: { statusCode: 404, defaultMessage: 'Chuyến không tồn tại' },
	50071: {
		statusCode: 409,
		defaultMessage: 'Trạng thái chuyến không cho phép thao tác',
	},
	50072: {
		statusCode: 409,
		defaultMessage: 'Chuyến đã có vé, không đổi xe/giờ được',
	},
	50073: { statusCode: 409, defaultMessage: 'Không thể check-in vé' },
	50074: { statusCode: 404, defaultMessage: 'Mã vé không tồn tại' },
	50080: { statusCode: 409, defaultMessage: 'Booking đã được thanh toán' },
	50081: { statusCode: 409, defaultMessage: 'Mã giao dịch đã tồn tại' },
	50082: {
		statusCode: 409,
		defaultMessage: 'Số tiền thanh toán không khớp tổng tiền booking',
	},
	50083: {
		statusCode: 409,
		defaultMessage: 'Booking chưa được xác nhận nên chưa thể thanh toán',
	},
	50090: { statusCode: 400, defaultMessage: 'Tham số báo cáo không hợp lệ' },
	1205: {
		statusCode: 503,
		defaultMessage: 'Hệ thống đang bận, vui lòng thử lại sau',
	},
}

function getSqlErrorNumber(error: unknown): number | undefined {
	if (typeof error !== 'object' || error === null || !('number' in error)) {
		return undefined
	}

	const { number } = error
	return typeof number === 'number' ? number : undefined
}

export const errorHandler: ErrorRequestHandler = (
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction
): void => {
	if (err instanceof AppError) {
		res.status(err.statusCode).json({
			success: false,
			message: err.message,
			error: {
				message: err.message,
				statusCode: err.statusCode,
			},
		})
		return
	}

	const sqlErrorNumber = getSqlErrorNumber(err)
	if (sqlErrorNumber !== undefined) {
		const mapping = SQL_ERROR_MAP[sqlErrorNumber]
		if (mapping) {
			res.status(mapping.statusCode).json({
				success: false,
				message: mapping.defaultMessage,
				error: {
					message: mapping.defaultMessage,
					statusCode: mapping.statusCode,
				},
			})
			return
		}
	}

	console.error('[Unhandled Error]', err)

	res.status(500).json({
		success: false,
		message: 'Đã xảy ra lỗi nội bộ máy chủ',
		error: {
			message: 'Đã xảy ra lỗi nội bộ máy chủ',
			statusCode: 500,
		},
	})
}
