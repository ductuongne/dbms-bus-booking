import type {
  User,
  Province,
  Station,
  Route,
  BusType,
  Bus,
  Seat,
  Driver,
  Trip,
  Booking,
  Payment,
  Ticket,
  TripCardView,
  SeatLayoutView,
  SeatItemView,
  PromotionCardView,
  StopPointView,
  BookingCheckoutView,
} from '../types';

import {
  USER_ROLES,
  BUS_STATUS,
  SEAT_TYPES,
  TRIP_STATUS,
  BOOKING_CHANNELS,
  BOOKING_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  TICKET_STATUS,
  VIETQR_CONFIG,
} from '../constants';

// ==========================================
// 1. PROVINCES (Tỉnh / Thành phố)
// ==========================================
export const mockProvinces: Province[] = [
  { id: 'PRV-01', name: 'Hà Nội' },
  { id: 'PRV-02', name: 'Hồ Chí Minh' },
  { id: 'PRV-03', name: 'Đà Nẵng' },
  { id: 'PRV-04', name: 'Lâm Đồng' },
  { id: 'PRV-05', name: 'Ninh Bình' },
  { id: 'PRV-06', name: 'Hải Phòng' },
  { id: 'PRV-07', name: 'Quảng Ninh' },
  { id: 'PRV-08', name: 'Thanh Hóa' },
];

// ==========================================
// 2. STATIONS (Bến xe / Văn phòng đón trả)
// ==========================================
export const mockStations: Station[] = [
  // Hà Nội
  { id: 'STA-HN-01', name: 'Bến xe Mỹ Đình', provinceId: 'PRV-01', address: 'Số 20 Phạm Hùng, Mỹ Đình 2, Nam Từ Liêm, Hà Nội' },
  { id: 'STA-HN-02', name: 'Bến xe Giáp Bát', provinceId: 'PRV-01', address: 'Km 6 Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội' },
  { id: 'STA-HN-03', name: 'Số 72 Trần Nhân Tông', provinceId: 'PRV-01', address: 'Số 72 Trần Nhân Tông, Nguyễn Du, Hai Bà Trưng, Hà Nội' },
  { id: 'STA-HN-04', name: 'Sân bay Nội Bài', provinceId: 'PRV-01', address: 'Nhà ga T1/T2, Sân bay Quốc tế Nội Bài, Sóc Sơn, Hà Nội' },
  { id: 'STA-HN-05', name: 'Quận Hoàng Mai', provinceId: 'PRV-01', address: 'Đường Giải Phóng, Quận Hoàng Mai, Hà Nội' },

  // Ninh Bình
  { id: 'STA-NB-01', name: 'VP 251 Lương Văn Thăng (X.E VIỆT NAM)', provinceId: 'PRV-05', address: 'Số 251 Lương Văn Thăng, Đông Thành, TP. Ninh Bình' },
  { id: 'STA-NB-02', name: 'Thành phố Ninh Bình', provinceId: 'PRV-05', address: 'Đường Lê Thái Tổ, Phường Nam Thành, TP. Ninh Bình' },
  { id: 'STA-NB-03', name: 'Bến thuyền Tràng An', provinceId: 'PRV-05', address: 'Khu du lịch sinh thái Tràng An, Hoa Lư, Ninh Bình' },
  { id: 'STA-NB-04', name: 'Bến thuyền Tam Cốc', provinceId: 'PRV-05', address: 'Ninh Hải, Hoa Lư, Ninh Bình' },

  // TP. Hồ Chí Minh
  { id: 'STA-01', name: 'Bến xe Miền Đông', provinceId: 'PRV-02', address: '292 Đinh Bộ Lĩnh, Phường 26, Bình Thạnh, TP. Hồ Chí Minh' },
  { id: 'STA-HCM-02', name: 'Bến xe Miền Tây', provinceId: 'PRV-02', address: '395 Kinh Dương Vương, An Lạc, Bình Tân, TP. Hồ Chí Minh' },

  // Lâm Đồng (Đà Lạt)
  { id: 'STA-02', name: 'Bến xe Liên Tỉnh Đà Lạt', provinceId: 'PRV-04', address: 'Số 1 Tô Hiến Thành, Phường 3, TP. Đà Lạt, Lâm Đồng' },
];

// ==========================================
// 3. ROUTES (Tuyến đường vận hành)
// ==========================================
export const mockRoutes: Route[] = [
  {
    id: 'RT-HAN-NBI',
    departureStationId: 'STA-HN-05', // Hoàng Mai / Hà Nội
    arrivalStationId: 'STA-NB-02',   // TP Ninh Bình
    distanceKm: 95.0,
    estimatedDuration: 75, // 1g 15ph
  },
  {
    id: 'RT-HAN-NBI-02',
    departureStationId: 'STA-HN-03', // 72 Trần Nhân Tông
    arrivalStationId: 'STA-NB-01',   // 251 Lương Văn Thăng
    distanceKm: 98.0,
    estimatedDuration: 100, // 1g 40ph
  },
  {
    id: 'RT-NBA-NBI',
    departureStationId: 'STA-HN-04', // Sân bay Nội Bài
    arrivalStationId: 'STA-NB-02',   // TP Ninh Bình
    distanceKm: 120.0,
    estimatedDuration: 60, // 1g 00ph (Cao tốc)
  },
  {
    id: 'RT-SGN-DLI',
    departureStationId: 'STA-01', // Miền Đông
    arrivalStationId: 'STA-02',   // Đà Lạt
    distanceKm: 300.5,
    estimatedDuration: 480, // 8 tiếng
  },
];

// ==========================================
// 4. BUS TYPES (Loại xe)
// ==========================================
export const mockBusTypes: BusType[] = [
  {
    id: 'BT-LIM-11',
    name: 'Limousine',
    totalSeats: 11,
    floors: 1,
  },
  {
    id: 'BT-LIM-22',
    name: 'Xe Limousine 22',
    totalSeats: 22,
    floors: 1,
  },
  {
    id: 'BT-SLP-34',
    name: 'Xe Giường Nằm 34',
    totalSeats: 34,
    floors: 2,
  },
  {
    id: 'BT-SIT-45',
    name: 'Xe Ghế Ngồi 45',
    totalSeats: 45,
    floors: 1,
  },
];

// ==========================================
// 5. BUSES (Phương tiện)
// ==========================================
export const mockBuses: Bus[] = [
  { id: 'BUS-01', licensePlate: '29B-888.12', typeId: 'BT-LIM-11', status: BUS_STATUS.ACTIVE },
  { id: 'BUS-02', licensePlate: '29B-668.99', typeId: 'BT-LIM-11', status: BUS_STATUS.ACTIVE },
  { id: 'BUS-03', licensePlate: '29B-512.44', typeId: 'BT-LIM-11', status: BUS_STATUS.ACTIVE },
  { id: 'BUS-04', licensePlate: '29B-734.56', typeId: 'BT-LIM-11', status: BUS_STATUS.ACTIVE },
  { id: 'BUS-05', licensePlate: '51B-987.65', typeId: 'BT-SLP-34', status: BUS_STATUS.ACTIVE },
  { id: 'BUS-06', licensePlate: '51B-333.22', typeId: 'BT-LIM-22', status: BUS_STATUS.ACTIVE },
];

// ==========================================
// 6. USERS & DRIVERS (Người dùng & Tài xế)
// ==========================================
export const mockUsers: User[] = [
  {
    id: 'USR-ADMIN-1',
    fullName: 'System Administrator',
    email: 'admin@example.com',
    phone: '0901234567',
    role: USER_ROLES.ADMIN,
    loyaltyPoints: 0,
    isActive: true,
  },
  {
    id: 'USR-CUS-1',
    fullName: 'Nguyễn Văn A',
    email: 'nva@example.com',
    phone: '0988000111',
    role: USER_ROLES.CUSTOMER,
    loyaltyPoints: 150,
    isActive: true,
  },
  {
    id: 'USR-CUS-2',
    fullName: 'ádfs',
    email: 'dfsdfs@gmail.com',
    phone: '84328749584',
    role: USER_ROLES.CUSTOMER,
    loyaltyPoints: 50,
    isActive: true,
  },
  {
    id: 'USR-DRV-1',
    fullName: 'Trần Văn Lái',
    email: 'lai.tran@redbus.vn',
    phone: '0912345678',
    role: USER_ROLES.DRIVER,
    loyaltyPoints: 0,
    isActive: true,
  },
  {
    id: 'USR-DRV-2',
    fullName: 'Lê Hoàng Nam',
    email: 'nam.le@redbus.vn',
    phone: '0923456789',
    role: USER_ROLES.DRIVER,
    loyaltyPoints: 0,
    isActive: true,
  },
];

export const mockDrivers: Driver[] = [
  {
    id: 'DRV-01',
    userId: 'USR-DRV-1',
    licenseNumber: 'B2-88492048',
    licenseExpiry: '2028-12-31',
  },
  {
    id: 'DRV-02',
    userId: 'USR-DRV-2',
    licenseNumber: 'E-19402941',
    licenseExpiry: '2029-06-30',
  },
];

// ==========================================
// 7. SEATS GENERATOR FOR BUSES
// Phản ánh chuẩn layout xe Limousine 11 chỗ theo RedBus (image_af33a7.jpg)
// ==========================================
function generateLimousineSeats(busId: string, basePrice: number): SeatItemView[] {
  // Sơ đồ xe Limousine 11 chỗ theo hình image_af33a7.jpg:
  // Hàng 1: Tài xế (bên trái) - Ghế 1, Ghế 2 (bên phải)
  // Hàng 2: Ghế 3 (trái) - Ghế 4, Ghế 5 (phải)
  // Hàng 3: Trống (lối đi) - Ghế 6, Ghế 7 (phải)
  // Hàng 4: Ghế 8 (trái) - Ghế 9, Ghế 10 (phải)
  // Hàng 5: Hàng ghế cuối (Ghế 11, 12, 13, 14, 15)
  return [
    { id: `${busId}-S01`, busId, seatNumber: '01', floor: 1, row: 1, col: 2, seatType: SEAT_TYPES.VIP, status: 'BOOKED', price: basePrice },
    { id: `${busId}-S02`, busId, seatNumber: '02', floor: 1, row: 1, col: 3, seatType: SEAT_TYPES.VIP, status: 'BOOKED', price: basePrice },

    { id: `${busId}-S03`, busId, seatNumber: '03', floor: 1, row: 2, col: 1, seatType: SEAT_TYPES.VIP, status: 'AVAILABLE', price: basePrice },
    { id: `${busId}-S04`, busId, seatNumber: '04', floor: 1, row: 2, col: 2, seatType: SEAT_TYPES.VIP, status: 'BOOKED', price: basePrice },
    { id: `${busId}-S05`, busId, seatNumber: '05', floor: 1, row: 2, col: 3, seatType: SEAT_TYPES.VIP, status: 'BOOKED', price: basePrice },

    { id: `${busId}-S06`, busId, seatNumber: '06', floor: 1, row: 3, col: 2, seatType: SEAT_TYPES.VIP, status: 'AVAILABLE', price: basePrice },
    { id: `${busId}-S07`, busId, seatNumber: '07', floor: 1, row: 3, col: 3, seatType: SEAT_TYPES.VIP, status: 'BOOKED', price: basePrice },

    { id: `${busId}-S08`, busId, seatNumber: '08', floor: 1, row: 4, col: 1, seatType: SEAT_TYPES.VIP, status: 'BOOKED', price: basePrice },
    { id: `${busId}-S09`, busId, seatNumber: '09', floor: 1, row: 4, col: 2, seatType: SEAT_TYPES.VIP, status: 'BOOKED', price: basePrice },
    { id: `${busId}-S10`, busId, seatNumber: '10', floor: 1, row: 4, col: 3, seatType: SEAT_TYPES.VIP, status: 'BOOKED', price: basePrice },

    { id: `${busId}-S11`, busId, seatNumber: '11', floor: 1, row: 5, col: 1, seatType: SEAT_TYPES.NORMAL, status: 'BOOKED', price: basePrice - 10000 },
    { id: `${busId}-S12`, busId, seatNumber: '12', floor: 1, row: 5, col: 2, seatType: SEAT_TYPES.NORMAL, status: 'BOOKED', price: basePrice - 10000 },
    { id: `${busId}-S13`, busId, seatNumber: '13', floor: 1, row: 5, col: 3, seatType: SEAT_TYPES.NORMAL, status: 'BOOKED', price: basePrice - 10000 },
    { id: `${busId}-S14`, busId, seatNumber: '14', floor: 1, row: 5, col: 4, seatType: SEAT_TYPES.NORMAL, status: 'AVAILABLE', price: basePrice - 10000 },
    { id: `${busId}-S15`, busId, seatNumber: '15', floor: 1, row: 5, col: 4, seatType: SEAT_TYPES.VIP, status: 'AVAILABLE', price: basePrice },
  ];
}

export const mockSeats: Seat[] = [
  ...generateLimousineSeats('BUS-01', 180000),
  ...generateLimousineSeats('BUS-02', 175000),
  ...generateLimousineSeats('BUS-03', 180000),
  ...generateLimousineSeats('BUS-04', 190000),
];

// ==========================================
// 8. TRIPS (Chuyến xe vận hành)
// ==========================================
export const mockTrips: Trip[] = [
  {
    id: 'TRIP-HN-NB-01',
    routeId: 'RT-HAN-NBI',
    busId: 'BUS-01',
    driverId: 'DRV-01',
    departureTime: '2026-10-18T16:15:00',
    arrivalTime: '2026-10-18T17:30:00',
    price: 180000,
    status: TRIP_STATUS.SCHEDULED,
  },
  {
    id: 'TRIP-HN-NB-02',
    routeId: 'RT-NBA-NBI',
    busId: 'BUS-03',
    driverId: 'DRV-02',
    departureTime: '2026-10-18T16:30:00',
    arrivalTime: '2026-10-18T17:30:00',
    price: 180000,
    status: TRIP_STATUS.SCHEDULED,
  },
  {
    id: 'TRIP-HN-NB-03',
    routeId: 'RT-HAN-NBI-02',
    busId: 'BUS-02',
    driverId: 'DRV-01',
    departureTime: '2026-10-18T17:20:00',
    arrivalTime: '2026-10-18T19:50:00',
    price: 180000,
    status: TRIP_STATUS.SCHEDULED,
  },
  {
    id: 'TRIP-HN-NB-04',
    routeId: 'RT-HAN-NBI-02',
    busId: 'BUS-02',
    driverId: 'DRV-02',
    departureTime: '2026-10-18T17:50:00',
    arrivalTime: '2026-10-18T19:30:00',
    price: 175000,
    status: TRIP_STATUS.SCHEDULED,
  },
  {
    id: 'TRIP-HN-NB-05',
    routeId: 'RT-HAN-NBI',
    busId: 'BUS-04',
    driverId: 'DRV-01',
    departureTime: '2026-10-18T08:30:00',
    arrivalTime: '2026-10-18T10:00:00',
    price: 190000,
    status: TRIP_STATUS.SCHEDULED,
  },
  {
    id: 'TRIP-HN-NB-06',
    routeId: 'RT-HAN-NBI',
    busId: 'BUS-01',
    driverId: 'DRV-02',
    departureTime: '2026-10-18T13:00:00',
    arrivalTime: '2026-10-18T14:15:00',
    price: 180000,
    status: TRIP_STATUS.SCHEDULED,
  },
  {
    id: 'TRIP-HN-NB-07',
    routeId: 'RT-HAN-NBI',
    busId: 'BUS-03',
    driverId: 'DRV-01',
    departureTime: '2026-10-18T20:30:00',
    arrivalTime: '2026-10-18T21:45:00',
    price: 170000,
    status: TRIP_STATUS.SCHEDULED,
  },
];

// ==========================================
// 9. STOP POINTS (Điểm đón & Điểm trả chi tiết)
// Phù hợp tab "Chọn điểm đón và điểm trả" trong UI
// ==========================================
export const mockStopPoints: Record<string, { pickup: StopPointView[]; dropoff: StopPointView[] }> = {
  'TRIP-HN-NB-01': {
    pickup: [
      { id: 'PK-01', name: 'Quận Hoàng Mai', address: 'Đường Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội', time: '16:15', type: 'PICKUP' },
      { id: 'PK-02', name: 'Bến xe Nước Ngầm', address: 'Số 1 Ngọc Hồi, Hoàng Liệt, Hoàng Mai, Hà Nội', time: '16:25', type: 'PICKUP' },
      { id: 'PK-03', name: 'Đón tận nhà nội thành', address: 'Các quận Hoàn Kiếm, Đống Đa, Hai Bà Trưng', time: '15:45', type: 'PICKUP' },
    ],
    dropoff: [
      { id: 'DP-01', name: 'Thành phố Ninh Bình', address: 'Trục đường Lê Thái Tổ, TP. Ninh Bình', time: '17:30', type: 'DROPOFF' },
      { id: 'DP-02', name: 'Bến thuyền Tam Cốc', address: 'Khu du lịch Tam Cốc, Hoa Lư, Ninh Bình', time: '17:45', type: 'DROPOFF' },
      { id: 'DP-03', name: 'Bến thuyền Tràng An', address: 'Khu du lịch Tràng An, Hoa Lư, Ninh Bình', time: '17:50', type: 'DROPOFF' },
    ],
  },
  'TRIP-HN-NB-04': {
    pickup: [
      { id: 'PK-04', name: 'Số 72 Trần Nhân Tông', address: 'Số 72 Trần Nhân Tông, Hai Bà Trưng, Hà Nội', time: '17:50', type: 'PICKUP' },
      { id: 'PK-05', name: 'Rạp xiếc Trung Ương', address: 'Trần Nhân Tông, Nguyễn Du, Hai Bà Trưng', time: '17:55', type: 'PICKUP' },
      { id: 'PK-06', name: 'Bệnh viện Bạch Mai', address: '78 Giải Phóng, Phương Mai, Đống Đa, Hà Nội', time: '18:05', type: 'PICKUP' },
    ],
    dropoff: [
      { id: 'DP-04', name: 'VP 251 Lương Văn Thăng', address: 'VP 251 Lương Văn Thăng (X.E VIET NAM NINH BINH OFFICE), Ninh Bình', time: '19:30', type: 'DROPOFF' },
      { id: 'DP-05', name: 'Cổng chào Ninh Bình', address: 'Quốc Lộ 1A, Phường Nam Thành, TP. Ninh Bình', time: '19:40', type: 'DROPOFF' },
    ],
  },
};

// ==========================================
// 10. PROMOTIONS & DEALS (Ưu đãi dành cho bạn)
// Phản ánh chuẩn từ screenshot image_af2fe3.jpg
// ==========================================
export const mockPromotions: PromotionCardView[] = [
  {
    id: 'PROMO-01',
    code: 'SIEUSALET10',
    title: 'Đặt vé xe online - Siêu Deal Tháng 10',
    description: 'Giảm giá tới 40% áp dụng cho toàn bộ các tuyến xe limousine và giường nằm toàn quốc.',
    discountBadge: 'Giảm đến 40%',
    expiryText: 'Hạn sử dụng đến 31 Th10',
    bannerUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80',
    accentColor: '#FF385C',
  },
  {
    id: 'PROMO-02',
    code: 'DAUTIEN',
    title: 'Tiết kiệm tới 30% khi đặt vé xe lần đầu',
    description: 'Ưu đãi dành riêng cho khách hàng mới đặt vé trên nền tảng website redBus.',
    discountBadge: 'Giảm tới 30% + 10% hoàn tiền',
    expiryText: 'Hạn sử dụng đến 31 Th3',
    bannerUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80',
  },
  {
    id: 'PROMO-03',
    code: 'TIEPTHEO20',
    title: 'Tiết kiệm 20% cho lần đặt vé tiếp theo',
    description: 'Áp dụng cho mọi khách hàng thân thiết có từ 1 lần đặt vé hoàn tất.',
    discountBadge: 'Giảm 20%',
    expiryText: 'Hạn sử dụng đến 31 Th3',
    bannerUrl: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=600&q=80',
  },
  {
    id: 'PROMO-04',
    code: 'ZALOPAY30',
    title: 'Giảm giá lên đến 30,000 VNĐ khi thanh toán bằng ví ZaloPay',
    description: 'Nhập mã giảm giá khi thanh toán qua ZaloPay hoặc quét mã VietQR hỗ trợ.',
    discountBadge: 'Giảm 30.000đ',
    expiryText: 'Hạn sử dụng đến 31 Th3',
  },
  {
    id: 'PROMO-05',
    code: 'GREENSM50',
    title: 'Giảm giá lên đến 50,000 VNĐ khi đặt xe tại GreenSM',
    description: 'Tặng voucher đưa đón bến xe hoặc điểm đón tận nhà với dịch vụ taxi điện.',
    discountBadge: 'Giảm 50.000đ',
    expiryText: 'Hạn sử dụng đến 31 Th12',
  },
];

// ==========================================
// 11. TRIP CARDS VIEW (Dữ liệu hiển thị danh sách tìm kiếm)
// Phản ánh chuẩn từ screenshot image_af2fa7.jpg & image_af33a7.jpg
// ==========================================
export const mockTripCardViews: TripCardView[] = [
  {
    id: 'TRIP-HN-NB-01',
    tripCode: 'HL-1615',
    operator: {
      name: 'Hoa Lư Limousine',
      logoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&q=80',
      rating: 3.9,
      reviewCount: 148,
      amenities: ['Wifi tốc độ cao', 'Nước uống miễn phí', 'Cổng sạc USB', 'Điều hòa 2 chiều', 'Chăn đắp', 'Màn hình LCD'],
      cancellationPolicy: 'Miễn phí hủy vé trước 12 tiếng giờ khởi hành.',
    },
    busType: mockBusTypes[0], // Limousine 11 chỗ
    bus: mockBuses[0],
    route: mockRoutes[0],
    departureStation: mockStations[4], // Quận Hoàng Mai
    arrivalStation: mockStations[6],   // Thành phố Ninh Bình
    departureTime: '16:15',
    departureDate: '2026-10-18',
    arrivalTime: '17:30',
    arrivalDate: '2026-10-18',
    durationFormatted: '01g 15ph',
    price: 180000,
    availableSeatsCount: 11,
    totalSeats: 11,
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&q=80',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&q=80',
      'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=500&q=80',
    ],
    tags: ['Xác nhận tức thì', 'Có thể hủy', 'Đón tận nhà', 'Trả tận nhà'],
    pickupPoints: mockStopPoints['TRIP-HN-NB-01'].pickup,
    dropoffPoints: mockStopPoints['TRIP-HN-NB-01'].dropoff,
  },
  {
    id: 'TRIP-HN-NB-02',
    tripCode: 'HL-1630',
    operator: {
      name: 'Hoa Lư Limousine',
      logoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&q=80',
      rating: 3.9,
      reviewCount: 92,
      amenities: ['Wifi tốc độ cao', 'Nước uống miễn phí', 'Cổng sạc USB', 'Điều hòa', 'Đón sảnh sân bay'],
      cancellationPolicy: 'Hủy trước 24 giờ hoàn 90% giá vé.',
    },
    busType: mockBusTypes[0],
    bus: mockBuses[2],
    route: mockRoutes[2],
    departureStation: mockStations[3], // Sân bay Nội Bài
    arrivalStation: mockStations[6],   // Thành phố Ninh Bình
    departureTime: '16:30',
    departureDate: '2026-10-18',
    arrivalTime: '17:30',
    arrivalDate: '2026-10-18',
    durationFormatted: '01g 00ph',
    price: 180000,
    availableSeatsCount: 11,
    totalSeats: 11,
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&q=80',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&q=80',
      'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=500&q=80',
    ],
    tags: ['Xác nhận tức thì', 'Có thể hủy', 'Đón sân bay'],
    pickupPoints: [
      { id: 'PK-NB-01', name: 'Sân bay Nội Bài - Cột 9 Tầng 1 Ga T1', address: 'Nhà ga Quốc nội T1, Sân bay Nội Bài', time: '16:30', type: 'PICKUP' },
      { id: 'PK-NB-02', name: 'Cột 12 Ga Quốc tế T2', address: 'Nhà ga Quốc tế T2, Sân bay Nội Bài', time: '16:40', type: 'PICKUP' },
    ],
    dropoffPoints: mockStopPoints['TRIP-HN-NB-01'].dropoff,
  },
  {
    id: 'TRIP-HN-NB-03',
    tripCode: 'XE-1720',
    operator: {
      name: 'X.E Việt Nam',
      logoUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=100&q=80',
      rating: 4.2,
      reviewCount: 312,
      amenities: ['Ghế massage VIP', 'Wifi cực nhanh', 'Nước suối lạnh & Khăn ướt', 'Cổng sạc Type-C', 'Bảo hiểm hành khách'],
      cancellationPolicy: 'Miễn phí hủy trước 6 tiếng.',
    },
    busType: mockBusTypes[0],
    bus: mockBuses[1],
    route: mockRoutes[1],
    departureStation: mockStations[2], // 72 Trần Nhân Tông
    arrivalStation: mockStations[5],   // VP 251 Lương Văn Thăng
    departureTime: '17:20',
    departureDate: '2026-10-18',
    arrivalTime: '19:50',
    arrivalDate: '2026-10-18',
    durationFormatted: '02g 30ph',
    price: 180000,
    availableSeatsCount: 9,
    totalSeats: 11,
    images: [
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&q=80',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&q=80',
    ],
    tags: ['Xác nhận tức thì', 'Có thể hủy', 'Trả tận nhà', 'Xe cao cấp'],
    pickupPoints: mockStopPoints['TRIP-HN-NB-04'].pickup,
    dropoffPoints: mockStopPoints['TRIP-HN-NB-04'].dropoff,
  },
  {
    id: 'TRIP-HN-NB-04',
    tripCode: 'XE-1750',
    operator: {
      name: 'X.E Việt Nam',
      logoUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=100&q=80',
      rating: 4.5,
      reviewCount: 420,
      amenities: ['Ghế da cao cấp', 'Wifi 5G', 'Khăn lạnh, nước suối', 'Cổng sạc điện thoại', 'Điều hòa lọc không khí'],
      cancellationPolicy: 'Miễn phí hủy trước 6 tiếng.',
    },
    busType: mockBusTypes[0],
    bus: mockBuses[1],
    route: mockRoutes[1],
    departureStation: mockStations[2], // 72 Trần Nhân Tông
    arrivalStation: mockStations[5],   // VP 251 Lương Văn Thăng
    departureTime: '17:50',
    departureDate: '2026-10-18',
    arrivalTime: '19:30',
    arrivalDate: '2026-10-18',
    durationFormatted: '01g 40ph',
    price: 175000, // Giá có ưu đãi 5.000đ như trong hình image_af37df.png
    availableSeatsCount: 10,
    totalSeats: 11,
    images: [
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&q=80',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&q=80',
    ],
    tags: ['Xác nhận tức thì', 'Có thể hủy', 'Đón tận nhà', 'Ưu đãi Deal 5.000đ'],
    pickupPoints: mockStopPoints['TRIP-HN-NB-04'].pickup,
    dropoffPoints: mockStopPoints['TRIP-HN-NB-04'].dropoff,
  },
];

// ==========================================
// 12. SEAT LAYOUT VIEW (Mô phỏng bản đồ ghế trực quan)
// Phản ánh chuẩn từ screenshot image_af33a7.jpg
// ==========================================
export const mockSeatLayouts: Record<string, SeatLayoutView> = {
  'BUS-01': {
    busId: 'BUS-01',
    busTypeName: 'Limousine 11 chỗ',
    floors: 1,
    totalSeats: 11,
    driverSeatPosition: { floor: 1, row: 1, col: 1 },
    seats: generateLimousineSeats('BUS-01', 180000),
  },
  'BUS-02': {
    busId: 'BUS-02',
    busTypeName: 'Limousine 11 chỗ',
    floors: 1,
    totalSeats: 11,
    driverSeatPosition: { floor: 1, row: 1, col: 1 },
    seats: generateLimousineSeats('BUS-02', 175000),
  },
};

// ==========================================
// 13. BOOKINGS, TICKETS & PAYMENTS
// Khởi tạo đơn hàng khớp 100% screenshot thanh toán (image_af37df.png)
// ==========================================
export const mockBookings: Booking[] = [
  {
    id: 'BK-20261018-001',
    bookingCode: 'RB-98425',
    customerId: 'USR-CUS-2',
    channel: BOOKING_CHANNELS.ONLINE,
    createdAt: '2026-10-18T16:20:00',
    expiredAt: '2026-10-18T16:25:00',
    totalAmount: 175000,
    status: BOOKING_STATUS.PENDING,
  },
];

export const mockTickets: Ticket[] = [
  {
    id: 'TCK-001',
    ticketCode: 'TCK-98425-15',
    bookingId: 'BK-20261018-001',
    tripId: 'TRIP-HN-NB-04',
    seatId: 'BUS-02-S15',
    passengerName: 'ádfs',
    passengerPhone: '84328749584',
    price: 175000,
    status: TICKET_STATUS.BOOKED,
  },
];

export const mockPayments: Payment[] = [
  {
    id: 'PAY-001',
    bookingId: 'BK-20261018-001',
    method: PAYMENT_METHODS.BANK_TRANSFER,
    amount: 175000,
    paidAt: null,
    transactionCode: 'VQR-TX-98425',
    status: PAYMENT_STATUS.PENDING,
  },
];

// Chi tiết đơn hàng mẫu hoàn chỉnh để hiển thị màn hình thanh toán VietQR
export const mockBookingCheckoutView: BookingCheckoutView = {
  bookingId: 'BK-20261018-001',
  bookingCode: 'RB-98425',
  trip: mockTripCardViews[3], // X.E Việt Nam 17:50 - 19:30
  selectedSeats: [
    {
      id: 'BUS-02-S15',
      busId: 'BUS-02',
      seatNumber: '15',
      floor: 1,
      row: 5,
      col: 4,
      seatType: SEAT_TYPES.VIP,
      status: 'SELECTED',
      price: 175000,
    },
  ],
  pickupPoint: {
    id: 'PK-04',
    name: 'Số 72 Trần Nhân Tông, Hai Bà Trưng, Hà Nội',
    address: 'Số 72 Trần Nhân Tông, Hai Bà Trưng, Hà Nội',
    time: '17:50',
    type: 'PICKUP',
  },
  dropoffPoint: {
    id: 'DP-04',
    name: 'VP 251 Lương Văn Thăng (X.E VIET NAM NINH BINH OFFICE), Ninh Bình',
    address: 'VP 251 Lương Văn Thăng (X.E VIET NAM NINH BINH OFFICE), Ninh Bình',
    time: '19:30',
    type: 'DROPOFF',
  },
  passenger: {
    fullName: 'ádfs',
    phone: '84328749584',
    email: 'dfsdfs@gmail.com',
  },
  totalOriginalAmount: 180000,
  discountAmount: 5000, // 5.000đ Ưu đãi Deal đã áp dụng
  finalAmount: 175000,
  payment: {
    bankName: VIETQR_CONFIG.DEFAULT_BANK,
    bankBin: VIETQR_CONFIG.BANK_BIN,
    accountNumber: VIETQR_CONFIG.ACCOUNT_NUMBER,
    accountName: VIETQR_CONFIG.ACCOUNT_NAME,
    amount: 175000,
    transferContent: 'REDBUS RB-98425',
    // Tạo link ảnh VietQR thật theo chuẩn VietQR Quick Link
    qrImageUrl: `https://img.vietqr.io/image/${VIETQR_CONFIG.BANK_BIN}-${VIETQR_CONFIG.ACCOUNT_NUMBER}-compact2.png?amount=175000&addInfo=REDBUS%20RB-98425&accountName=${encodeURIComponent(VIETQR_CONFIG.ACCOUNT_NAME)}`,
    countdownSeconds: VIETQR_CONFIG.DEFAULT_COUNTDOWN_SECONDS,
  },
};

// ==========================================
// 14. HELPER FUNCTIONS FOR CLIENT APPLICATION
// Tiện ích tìm kiếm, lọc và truy xuất dữ liệu giả lập
// ==========================================

export function searchMockTrips(
  originProvinceName?: string,
  destinationProvinceName?: string,
  departureDate?: string
): TripCardView[] {
  let results = [...mockTripCardViews];

  if (departureDate) {
    results = results.filter((item) => item.departureDate === departureDate);
  }

  if (originProvinceName) {
    const originLower = originProvinceName.toLowerCase().trim();
    results = results.filter(
      (item) =>
        item.departureStation.name.toLowerCase().includes(originLower) ||
        item.departureStation.address.toLowerCase().includes(originLower) ||
        originLower.includes('hà nội') ||
        originLower.includes('ha noi')
    );
  }

  if (destinationProvinceName) {
    const destLower = destinationProvinceName.toLowerCase().trim();
    results = results.filter(
      (item) =>
        item.arrivalStation.name.toLowerCase().includes(destLower) ||
        item.arrivalStation.address.toLowerCase().includes(destLower) ||
        destLower.includes('ninh bình') ||
        destLower.includes('ninh binh')
    );
  }

  return results;
}

export function getMockSeatLayoutByTripId(tripId: string): SeatLayoutView {
  const trip = mockTripCardViews.find((t) => t.id === tripId);
  const busId = trip ? trip.bus.id : 'BUS-01';
  return mockSeatLayouts[busId] || mockSeatLayouts['BUS-01'];
}

export function getMockTripById(tripId: string): TripCardView | undefined {
  return mockTripCardViews.find((t) => t.id === tripId);
}
