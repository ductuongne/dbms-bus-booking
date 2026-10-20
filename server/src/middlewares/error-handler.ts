import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/app-error.js'

export { AppError }

const SQL_ERROR_MAP: Record<
	number,
	{ statusCode: number; defaultMessage: string }
> = {
	// Hệ thống & Giao dịch
	1205: {
		statusCode: 503,
		defaultMessage: 'Hệ thống đang bận do tranh chấp tài nguyên, vui lòng thử lại sau',
	},
	547: {
		statusCode: 409,
		defaultMessage: 'Dữ liệu đang được liên kết hoặc vi phạm ràng buộc toàn vẹn',
	},
	2601: {
		statusCode: 409,
		defaultMessage: 'Dữ liệu đã tồn tại trong hệ thống (trùng lặp khóa)',
	},
	2627: {
		statusCode: 409,
		defaultMessage: 'Dữ liệu đã tồn tại trong hệ thống (trùng lặp ràng buộc duy nhất)',
	},

	// Nghiệp vụ Đặt vé, Người dùng & Chuyến xe
	50010: { statusCode: 404, defaultMessage: 'Dữ liệu hoặc người dùng không tồn tại' },
	50011: { statusCode: 409, defaultMessage: 'Số điện thoại này đã được đăng ký trong hệ thống' },
	50012: { statusCode: 409, defaultMessage: 'Email này đã được đăng ký trong hệ thống' },
	50013: { statusCode: 409, defaultMessage: 'Người dùng đã có lịch sử đặt vé, không thể xóa' },
	50014: { statusCode: 409, defaultMessage: 'Tài xế đang được phân công chuyến xe hoạt động, không thể xóa' },
	50020: { statusCode: 409, defaultMessage: 'Ghế không thuộc xe của chuyến' },
	50021: { statusCode: 409, defaultMessage: 'Xe bị trùng lịch với chuyến khác' },
	50022: { statusCode: 409, defaultMessage: 'Tài xế bị trùng lịch với chuyến khác' },
	50023: {
		statusCode: 409,
		defaultMessage: 'Vé khác chuyến trong cùng booking',
	},
	50024: { statusCode: 409, defaultMessage: 'Bằng lái của tài xế đã hết hạn trước thời điểm khởi hành của chuyến xe' },
	50025: { statusCode: 409, defaultMessage: 'Phương tiện đang tạm dừng hoạt động, không thể phân công vào chuyến xe' },
	50026: { statusCode: 409, defaultMessage: 'Số lượng vé của chuyến xe vượt quá tổng số ghế của phương tiện' },
	50030: { statusCode: 409, defaultMessage: 'Ghế đã được giữ hoặc đã bán' },
	50031: {
		statusCode: 409,
		defaultMessage: 'Tranh chấp giữ chỗ, vui lòng thử lại',
	},
	50040: {
		statusCode: 404,
		defaultMessage:
			'Booking không tồn tại hoặc thông tin xác thực không đúng',
	},
	50041: { statusCode: 409, defaultMessage: 'Trạng thái booking không hợp lệ' },
	50042: { statusCode: 410, defaultMessage: 'Booking đã hết hạn giữ chỗ' },
	50043: { statusCode: 409, defaultMessage: 'Không thể xóa đơn đặt vé đã xác nhận hoặc đã thanh toán thành công' },
	50050: {
		statusCode: 409,
		defaultMessage: 'Không thể hủy booking không ở trạng thái giữ chỗ',
	},
	50060: { statusCode: 422, defaultMessage: 'Chuyến đi không khả dụng' },
	50061: { statusCode: 400, defaultMessage: 'Thông tin chuyến xe không hợp lệ (kiểm tra xe, tài xế, thời gian hoặc giá vé)' },
	50062: { statusCode: 422, defaultMessage: 'Khách hàng không tồn tại' },
	50070: { statusCode: 404, defaultMessage: 'Chuyến không tồn tại' },
	50071: {
		statusCode: 409,
		defaultMessage: 'Trạng thái chuyến không cho phép thao tác',
	},
	50072: {
		statusCode: 409,
		defaultMessage: 'Chuyến đã có vé, không thể thay đổi thông tin xe/giờ chạy',
	},
	50073: { statusCode: 409, defaultMessage: 'Vé không check-in được (chuyến xe không ở trạng thái sẵn sàng hoặc đang chạy)' },
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
	50085: {
		statusCode: 409,
		defaultMessage: 'Không thể xóa giao dịch thanh toán thành công khỏi sổ cái kế toán',
	},
	50090: { statusCode: 400, defaultMessage: 'Tham số báo cáo không hợp lệ' },

	// Quản trị Bến xe (Station)
	51010: { statusCode: 404, defaultMessage: 'Bến xe không tồn tại' },
	51011: { statusCode: 409, defaultMessage: 'Bến xe đang được sử dụng trong các tuyến đường, không thể xóa' },
	51012: { statusCode: 409, defaultMessage: 'Tên bến xe đã tồn tại trong tỉnh/thành phố này' },

	// Quản trị Tuyến đường (Route)
	51020: { statusCode: 404, defaultMessage: 'Tuyến đường không tồn tại' },
	51021: { statusCode: 409, defaultMessage: 'Tuyến đường đang có chuyến xe hoạt động, không thể xóa' },
	51022: { statusCode: 409, defaultMessage: 'Tuyến đường giữa hai bến xe này đã tồn tại' },

	// Quản trị Phương tiện (Bus)
	51030: { statusCode: 404, defaultMessage: 'Phương tiện không tồn tại' },
	51031: { statusCode: 409, defaultMessage: 'Phương tiện đang có chuyến xe hoạt động, không thể xóa' },
	51032: { statusCode: 409, defaultMessage: 'Biển số xe đã tồn tại' },

	// Quản trị Loại phương tiện (Bus Type)
	51040: { statusCode: 404, defaultMessage: 'Loại phương tiện không tồn tại' },
	51041: { statusCode: 409, defaultMessage: 'Loại phương tiện đang được sử dụng bởi các xe trong hệ thống, không thể xóa' },
}

function getSqlErrorNumber(error: unknown): number | undefined {
	if (typeof error !== 'object' || error === null || !('number' in error)) {
		return undefined
	}

	const { number } = error
	return typeof number === 'number' ? number : undefined
}

function extractSqlErrorMessage(err: unknown): string | null {
	if (typeof err !== 'object' || err === null || !('message' in err)) {
		return null
	}
	const raw = String((err as { message: unknown }).message || '')
	// Loại bỏ tiền tố của ODBC / SQL Server nếu có để lấy câu thông báo tiếng Việt sạch
	const match = raw.match(/\[SQL Server\]([^[\]]+)$/)
	if (match && match[1]) {
		return match[1].trim()
	}
	const cleaned = raw.replace(/^.*\[SQL Server\]\s*/i, '').replace(/^RequestError:\s*/i, '').trim()
	return cleaned.length > 0 ? cleaned : null
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
		const customMsg = extractSqlErrorMessage(err)
		
		if (mapping) {
			const finalMessage = customMsg || mapping.defaultMessage
			res.status(mapping.statusCode).json({
				success: false,
				message: finalMessage,
				error: {
					message: finalMessage,
					statusCode: mapping.statusCode,
				},
			})
			return
		}

		// Nếu là mã lỗi tự định nghĩa người dùng (50000 - 59999) nhưng chưa có trong map
		if (sqlErrorNumber >= 50000 && sqlErrorNumber < 60000) {
			const finalMessage = customMsg || 'Lỗi nghiệp vụ cơ sở dữ liệu'
			res.status(400).json({
				success: false,
				message: finalMessage,
				error: {
					message: finalMessage,
					statusCode: 400,
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
