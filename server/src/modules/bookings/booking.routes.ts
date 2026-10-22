import { Router } from 'express'
import { checkRole, verifyJWT } from '../../middlewares/auth.middleware.js'
import { bookingRateLimiter } from '../../middlewares/rate-limit'
import { validateRequest } from '../../middlewares/validate'
import { bookingController } from './booking.controller'
import {
	bookingCodeParamsSchema,
	bookingIdParamsSchema,
	bookingPhoneParamsSchema,
	cancelBookingBodySchema,
	checkInTicketBodySchema,
	confirmBookingBodySchema,
	holdBookingBodySchema,
	tripTicketsParamsSchema,
	tripTicketsQuerySchema
} from './booking.schema'

const router = Router()

// Giữ chỗ vé xe tạm thời (gọi sp_GiuCho)
router.post(
	'/hold',
	bookingRateLimiter,
	validateRequest({ body: holdBookingBodySchema }),
	bookingController.holdBooking.bind(bookingController)
)

// Xác nhận đơn đặt vé (gọi sp_DatVe)
router.post(
	'/:bookingId/confirm',
	bookingRateLimiter,
	validateRequest({ params: bookingIdParamsSchema, body: confirmBookingBodySchema }),
	bookingController.confirmBooking.bind(bookingController)
)

// Hủy giữ chỗ vé xe (gọi sp_HuyGiuCho)
router.post(
	'/:bookingId/cancel',
	bookingRateLimiter,
	validateRequest({ params: bookingIdParamsSchema, body: cancelBookingBodySchema }),
	bookingController.cancelBooking.bind(bookingController)
)

// Tra cứu thông tin vé qua mã booking (Booking Code - gọi sp_LayThongTinVe)
router.get(
	'/lookup/:bookingCode',
	validateRequest({ params: bookingCodeParamsSchema }),
	bookingController.getBookingByCode.bind(bookingController)
)

// Tra cứu danh sách đơn đặt vé theo số điện thoại (yêu cầu quyền STAFF, ADMIN hoặc DRIVER)
router.get(
	'/by-phone/:phone',
	verifyJWT,
	checkRole(['STAFF', 'ADMIN', 'DRIVER']),
	validateRequest({ params: bookingPhoneParamsSchema }),
	bookingController.getBookingsByPhone.bind(bookingController)
)

// Danh sách vé theo chuyến xe (gọi fn_LayVeTheoChuyen)
router.get(
	'/trips/:tripId/tickets',
	verifyJWT,
	checkRole(['STAFF', 'ADMIN', 'DRIVER']),
	validateRequest({ params: tripTicketsParamsSchema, query: tripTicketsQuerySchema }),
	bookingController.getTripTickets.bind(bookingController)
)

// Soát vé và check-in hành khách lên xe (gọi sp_CheckIn)
router.post(
	'/check-in',
	verifyJWT,
	checkRole(['STAFF', 'ADMIN', 'DRIVER']),
	validateRequest({ body: checkInTicketBodySchema }),
	bookingController.checkInTicket.bind(bookingController)
)

export default router
