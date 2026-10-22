import { Router } from 'express'
import { checkRole, verifyJWT } from '../../middlewares/auth.middleware.js'
import { validateRequest } from '../../middlewares/validate'
import { tripController } from './trip.controller'
import {
	adminTripsQuerySchema,
	changeTripStatusBodySchema,
	createTripBodySchema,
	driverTripsQuerySchema,
	searchTripsQuerySchema,
	tripIdParamsSchema,
	tripSeatsParamsSchema,
	updateTripBodySchema
} from './trip.schema'

const router = Router()

// Tra cứu danh sách chuyến xe công khai (gọi sp_TraCuuChuyenDi)
router.get(
	'/search',
	validateRequest({ query: searchTripsQuerySchema }),
	tripController.searchTrips.bind(tripController)
)

// Lấy sơ đồ ghế và trạng thái giữ chỗ của chuyến xe (gọi fn_LaySoDoGhe)
router.get(
	'/:tripId/seats',
	validateRequest({ params: tripSeatsParamsSchema }),
	tripController.getTripSeats.bind(tripController)
)

// Lịch trình phân công của tài xế (yêu cầu quyền DRIVER - gọi vw_DriverTrips)
router.get(
	'/driver',
	verifyJWT,
	checkRole(['DRIVER']),
	validateRequest({ query: driverTripsQuerySchema }),
	tripController.getDriverTrips.bind(tripController)
)

// Quản trị chuyến xe (yêu cầu quyền ADMIN hoặc STAFF)
// Tạo mới chuyến xe (gọi sp_TaoChuyen)
router.post(
	'/',
	verifyJWT,
	checkRole(['ADMIN', 'STAFF']),
	validateRequest({ body: createTripBodySchema }),
	tripController.createTrip.bind(tripController)
)

// Lấy danh sách chuyến xe quản trị kèm phân trang (gọi sp_LayDanhSachChuyenAdmin)
router.get(
	'/',
	verifyJWT,
	checkRole(['ADMIN', 'STAFF']),
	validateRequest({ query: adminTripsQuerySchema }),
	tripController.getAdminTrips.bind(tripController)
)

// Chi tiết chuyến xe (gọi vw_ChiTietChuyenDi)
router.get(
	'/:tripId',
	validateRequest({ params: tripIdParamsSchema }),
	tripController.getTripDetail.bind(tripController)
)

// Cập nhật thông tin chuyến xe (gọi sp_SuaChuyen)
router.put(
	'/:tripId',
	verifyJWT,
	checkRole(['ADMIN', 'STAFF']),
	validateRequest({ params: tripIdParamsSchema, body: updateTripBodySchema }),
	tripController.updateTrip.bind(tripController)
)

// Hủy chuyến xe và tự động hoàn vé/booking (gọi sp_HuyChuyen)
router.post(
	'/:tripId/cancel',
	verifyJWT,
	checkRole(['ADMIN', 'STAFF']),
	validateRequest({ params: tripIdParamsSchema }),
	tripController.cancelTrip.bind(tripController)
)

// Chuyển đổi trạng thái chuyến xe (gọi sp_DoiTrangThaiChuyen)
router.patch(
	'/:tripId/status',
	verifyJWT,
	checkRole(['ADMIN', 'STAFF']),
	validateRequest({ params: tripIdParamsSchema, body: changeTripStatusBodySchema }),
	tripController.changeTripStatus.bind(tripController)
)

export default router



