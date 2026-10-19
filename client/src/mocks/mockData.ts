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
  SeatCell,
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
  BUS_LAYOUT_CONFIGS,
  VIETQR_CONFIG,
} from '../constants';

import { toLocalISODate, addDays, buildSeatLabel } from '../utils';

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
  { id: 'STA-NB-01', name: 'VP 251 Lương Văn Thăng (XeViet Ninh Bình)', provinceId: 'PRV-05', address: 'Số 251 Lương Văn Thăng, Đông Thành, TP. Ninh Bình' },
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
    estimatedDuration: 60, // 1g 00ph
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
// 4. BUS TYPES (3 loại xe quy định tại B5)
// ==========================================
export const mockBusTypes: BusType[] = [
  {
    id: 'BT-SLP-34',
    name: 'Xe Giường Nằm 34',
    totalSeats: 34,
    floors: 2,
  },
  {
    id: 'BT-LIM-22',
    name: 'Xe Limousine Giường Nằm 22',
    totalSeats: 22,
    floors: 2,
  },
  {
    id: 'BT-LIM-09',
    name: 'Xe Limousine 9 Chỗ',
    totalSeats: 9,
    floors: 1,
  },
];

// ==========================================
// 5. BUSES (Phương tiện)
// ==========================================
export const mockBuses: Bus[] = [
  { id: 'BUS-01', licensePlate: '29B-888.12', typeId: 'BT-LIM-09', status: BUS_STATUS.ACTIVE },
  { id: 'BUS-02', licensePlate: '29B-668.99', typeId: 'BT-LIM-09', status: BUS_STATUS.ACTIVE },
  { id: 'BUS-03', licensePlate: '29B-512.44', typeId: 'BT-LIM-22', status: BUS_STATUS.ACTIVE },
  { id: 'BUS-04', licensePlate: '29B-734.56', typeId: 'BT-LIM-22', status: BUS_STATUS.ACTIVE },
  { id: 'BUS-05', licensePlate: '51B-987.65', typeId: 'BT-SLP-34', status: BUS_STATUS.ACTIVE },
  { id: 'BUS-06', licensePlate: '51B-333.22', typeId: 'BT-SLP-34', status: BUS_STATUS.ACTIVE },
];

// ==========================================
// 6. USERS & DRIVERS (Người dùng & Tài xế)
// ==========================================
export const mockUsers: User[] = [
  {
    id: 'USR-ADMIN-1',
    fullName: 'Quản trị viên XeViet',
    email: 'admin@example.com',
    phone: '0901234567',
    role: USER_ROLES.ADMIN,
    loyaltyPoints: 0,
    isActive: true,
  },
  {
    id: 'USR-STAFF-1',
    fullName: 'Nhân viên Điều hành',
    email: 'staff@example.com',
    phone: '0907654321',
    role: USER_ROLES.STAFF,
    loyaltyPoints: 0,
    isActive: true,
  },
  {
    id: 'USR-CUS-1',
    fullName: 'Nguyễn Văn An',
    email: 'nva@example.com',
    phone: '0988000111',
    role: USER_ROLES.CUSTOMER,
    loyaltyPoints: 150,
    isActive: true,
  },
  {
    id: 'USR-CUS-2',
    fullName: 'Trần Thị Mai',
    email: 'maitt@example.com',
    phone: '0987654321',
    role: USER_ROLES.CUSTOMER,
    loyaltyPoints: 50,
    isActive: true,
  },
  {
    id: 'USR-DRV-1',
    fullName: 'Trần Văn Lái',
    email: 'lai.tran@xeviet.vn',
    phone: '0912345678',
    role: USER_ROLES.DRIVER,
    loyaltyPoints: 0,
    isActive: true,
  },
  {
    id: 'USR-DRV-2',
    fullName: 'Lê Hoàng Nam',
    email: 'nam.le@xeviet.vn',
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
// 7. SEATS GENERATOR CHO 3 LOẠI XE (B5)
// ==========================================
export function generateBusSeats(busId: string, busTypeCode: string): SeatCell[] {
  const seats: SeatCell[] = [];

  if (busTypeCode === 'BT-SLP-34') {
    // Loại 1: Giường nằm 34 (2 tầng, 3 cột, 6 hàng, 17 ghế/tầng)
    // Hàng 1 có cột 1, cột 3 (cột 2 trống lối đi). Hàng 2-6 đủ 3 cột.
    // Tất cả ghế zone: 'blue'. Mock test: A14 là BOOKED.
    for (let floor = 1 as const; floor <= 2; floor++) {
      let seatIdx = 1;
      for (let row = 1; row <= 6; row++) {
        for (let col = 1; col <= 3; col++) {
          if (row === 1 && col === 2) continue; // Cột giữa hàng 1 trống

          const label = buildSeatLabel(floor, seatIdx, true);
          const isBookedTest = floor === 1 && seatIdx === 14; // A14

          seats.push({
            id: `${busId}-${label}`,
            label,
            seatNumber: label,
            floor,
            row,
            col,
            zone: 'blue',
            status: isBookedTest ? 'BOOKED' : 'AVAILABLE',
            price: 150000,
          });
          seatIdx++;
        }
      }
    }
  } else if (busTypeCode === 'BT-LIM-22') {
    // Loại 2: Limousine giường nằm 22 (2 tầng, 2 cột, 11 giường/tầng)
    // Hàng 1-5: 2 giường (01-10). Hàng 6: 1 giường cột trái (11).
    // Zone: hàng 1-5 'purple'; ghế 11 tầng 1 là 'amber', tầng 2 là 'green'.
    // Mock test: A02, A03, A04 là BOOKED.
    for (let floor = 1 as const; floor <= 2; floor++) {
      let seatIdx = 1;
      for (let row = 1; row <= 6; row++) {
        const colsInRow = row === 6 ? 1 : 2;
        for (let col = 1; col <= colsInRow; col++) {
          const label = buildSeatLabel(floor, seatIdx, true);
          const isBookedTest = floor === 1 && (seatIdx === 2 || seatIdx === 3 || seatIdx === 4);
          const zone = row <= 5 ? 'purple' : floor === 1 ? 'amber' : 'green';

          seats.push({
            id: `${busId}-${label}`,
            label,
            seatNumber: label,
            floor,
            row,
            col,
            zone,
            status: isBookedTest ? 'BOOKED' : 'AVAILABLE',
            price: 220000,
          });
          seatIdx++;
        }
      }
    }
  } else if (busTypeCode === 'BT-LIM-09') {
    // Loại 3: Limousine 9 chỗ (1 tầng, 3 cột, 4 hàng)
    // Hàng 1: driver cột 1, 01 cột 2, 02 cột 3.
    // Hàng 2: 03 cột 1, 04 cột 2.
    // Hàng 3: 05 cột 1, 06 cột 2.
    // Hàng 4: 07 cột 1, 08 cột 2, 09 cột 3.
    // Mock test: 04 BOOKED, 08 HELD.
    const rowColConfig: { row: number; col: number; label: string; zone: 'purple' | 'amber' | 'green' }[] = [
      { row: 1, col: 2, label: '01', zone: 'purple' },
      { row: 1, col: 3, label: '02', zone: 'purple' },
      { row: 2, col: 1, label: '03', zone: 'amber' },
      { row: 2, col: 2, label: '04', zone: 'amber' },
      { row: 3, col: 1, label: '05', zone: 'amber' },
      { row: 3, col: 2, label: '06', zone: 'amber' },
      { row: 4, col: 1, label: '07', zone: 'green' },
      { row: 4, col: 2, label: '08', zone: 'green' },
      { row: 4, col: 3, label: '09', zone: 'green' },
    ];

    for (const item of rowColConfig) {
      let status: 'AVAILABLE' | 'BOOKED' | 'HELD' = 'AVAILABLE';
      if (item.label === '04') status = 'BOOKED';
      if (item.label === '08') status = 'HELD';

      seats.push({
        id: `${busId}-${item.label}`,
        label: item.label,
        seatNumber: item.label,
        floor: 1,
        row: item.row,
        col: item.col,
        zone: item.zone,
        status,
        price: 180000,
      });
    }
  }

  return seats;
}

// Chuyển đổi SeatCell sang Seat (schema DB)
export const mockSeats: Seat[] = [
  ...generateBusSeats('BUS-01', 'BT-LIM-09').map((s) => ({
    id: s.id,
    seatNumber: s.label,
    floor: s.floor,
    seatType: SEAT_TYPES.VIP,
    busId: 'BUS-01',
  })),
  ...generateBusSeats('BUS-02', 'BT-LIM-09').map((s) => ({
    id: s.id,
    seatNumber: s.label,
    floor: s.floor,
    seatType: SEAT_TYPES.VIP,
    busId: 'BUS-02',
  })),
  ...generateBusSeats('BUS-03', 'BT-LIM-22').map((s) => ({
    id: s.id,
    seatNumber: s.label,
    floor: s.floor,
    seatType: SEAT_TYPES.SLEEPER,
    busId: 'BUS-03',
  })),
  ...generateBusSeats('BUS-05', 'BT-SLP-34').map((s) => ({
    id: s.id,
    seatNumber: s.label,
    floor: s.floor,
    seatType: SEAT_TYPES.SLEEPER,
    busId: 'BUS-05',
  })),
];

// ==========================================
// 8. TRIPS (Chuyến xe vận hành với ngày tương đối từ hôm nay)
// ==========================================
const todayStr = toLocalISODate(new Date());
const tomorrowStr = toLocalISODate(addDays(new Date(), 1));

export const mockTrips: Trip[] = [
  {
    id: 'TRIP-HN-NB-01',
    routeId: 'RT-HAN-NBI',
    busId: 'BUS-01', // BT-LIM-09
    driverId: 'DRV-01',
    departureTime: `${todayStr}T16:15:00`,
    arrivalTime: `${todayStr}T17:30:00`,
    price: 180000,
    status: TRIP_STATUS.SCHEDULED,
  },
  {
    id: 'TRIP-HN-NB-02',
    routeId: 'RT-NBA-NBI',
    busId: 'BUS-03', // BT-LIM-22
    driverId: 'DRV-02',
    departureTime: `${todayStr}T16:30:00`,
    arrivalTime: `${todayStr}T17:30:00`,
    price: 220000,
    status: TRIP_STATUS.SCHEDULED,
  },
  {
    id: 'TRIP-HN-NB-03',
    routeId: 'RT-HAN-NBI-02',
    busId: 'BUS-05', // BT-SLP-34
    driverId: 'DRV-01',
    departureTime: `${todayStr}T17:20:00`,
    arrivalTime: `${todayStr}T19:50:00`,
    price: 150000,
    status: TRIP_STATUS.SCHEDULED,
  },
  {
    id: 'TRIP-HN-NB-04',
    routeId: 'RT-HAN-NBI-02',
    busId: 'BUS-02', // BT-LIM-09
    driverId: 'DRV-02',
    departureTime: `${todayStr}T17:50:00`,
    arrivalTime: `${todayStr}T19:30:00`,
    price: 175000,
    status: TRIP_STATUS.SCHEDULED,
  },
  {
    id: 'TRIP-HN-NB-05',
    routeId: 'RT-HAN-NBI',
    busId: 'BUS-04', // BT-LIM-22
    driverId: 'DRV-01',
    departureTime: `${tomorrowStr}T08:30:00`,
    arrivalTime: `${tomorrowStr}T10:00:00`,
    price: 220000,
    status: TRIP_STATUS.SCHEDULED,
  },
  {
    id: 'TRIP-HN-NB-06',
    routeId: 'RT-HAN-NBI',
    busId: 'BUS-06', // BT-SLP-34
    driverId: 'DRV-02',
    departureTime: `${tomorrowStr}T13:00:00`,
    arrivalTime: `${tomorrowStr}T14:15:00`,
    price: 150000,
    status: TRIP_STATUS.SCHEDULED,
  },
];

// ==========================================
// 9. STOP POINTS (Điểm đón & Điểm trả)
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
  'TRIP-HN-NB-02': {
    pickup: [
      { id: 'PK-NB-01', name: 'Sân bay Nội Bài - Cột 9 T1', address: 'Nhà ga Quốc nội T1, Sân bay Nội Bài', time: '16:30', type: 'PICKUP' },
      { id: 'PK-NB-02', name: 'Cột 12 Ga Quốc tế T2', address: 'Nhà ga Quốc tế T2, Sân bay Nội Bài', time: '16:40', type: 'PICKUP' },
    ],
    dropoff: [
      { id: 'DP-01', name: 'Thành phố Ninh Bình', address: 'Trục đường Lê Thái Tổ, TP. Ninh Bình', time: '17:30', type: 'DROPOFF' },
      { id: 'DP-02', name: 'Bến thuyền Tam Cốc', address: 'Khu du lịch Tam Cốc, Hoa Lư, Ninh Bình', time: '17:45', type: 'DROPOFF' },
    ],
  },
  'TRIP-HN-NB-03': {
    pickup: [
      { id: 'PK-04', name: 'Số 72 Trần Nhân Tông', address: 'Số 72 Trần Nhân Tông, Hai Bà Trưng, Hà Nội', time: '17:20', type: 'PICKUP' },
      { id: 'PK-05', name: 'Rạp xiếc Trung Ương', address: 'Trần Nhân Tông, Nguyễn Du, Hai Bà Trưng', time: '17:25', type: 'PICKUP' },
    ],
    dropoff: [
      { id: 'DP-04', name: 'VP 251 Lương Văn Thăng', address: 'VP 251 Lương Văn Thăng, Ninh Bình', time: '19:50', type: 'DROPOFF' },
      { id: 'DP-05', name: 'Cổng chào Ninh Bình', address: 'Quốc Lộ 1A, Phường Nam Thành, TP. Ninh Bình', time: '20:00', type: 'DROPOFF' },
    ],
  },
  'TRIP-HN-NB-04': {
    pickup: [
      { id: 'PK-04', name: 'Số 72 Trần Nhân Tông', address: 'Số 72 Trần Nhân Tông, Hai Bà Trưng, Hà Nội', time: '17:50', type: 'PICKUP' },
      { id: 'PK-05', name: 'Rạp xiếc Trung Ương', address: 'Trần Nhân Tông, Nguyễn Du, Hai Bà Trưng', time: '17:55', type: 'PICKUP' },
      { id: 'PK-06', name: 'Bệnh viện Bạch Mai', address: '78 Giải Phóng, Phương Mai, Đống Đa, Hà Nội', time: '18:05', type: 'PICKUP' },
    ],
    dropoff: [
      { id: 'DP-04', name: 'VP 251 Lương Văn Thăng', address: 'VP 251 Lương Văn Thăng (XeViet Ninh Bình)', time: '19:30', type: 'DROPOFF' },
      { id: 'DP-05', name: 'Cổng chào Ninh Bình', address: 'Quốc Lộ 1A, Phường Nam Thành, TP. Ninh Bình', time: '19:40', type: 'DROPOFF' },
    ],
  },
};

// ==========================================
// 10. TRIP CARDS VIEW (Cho danh sách tìm kiếm)
// ==========================================
export const mockTripCardViews: TripCardView[] = [
  {
    id: 'TRIP-HN-NB-01',
    tripCode: 'XV-1615',
    operator: {
      name: 'XeViet Limousine',
      logoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&q=80',
      rating: 4.8,
      reviewCount: 148,
      amenities: ['Wifi tốc độ cao', 'Nước uống miễn phí', 'Cổng sạc USB', 'Điều hòa 2 chiều', 'Chăn đắp'],
      cancellationPolicy: 'Miễn phí hủy vé trước 12 tiếng giờ khởi hành.',
    },
    busType: mockBusTypes[2], // Limousine 9 Chỗ
    bus: mockBuses[0],
    route: mockRoutes[0],
    departureStation: mockStations[4], // Quận Hoàng Mai
    arrivalStation: mockStations[6],   // Thành phố Ninh Bình
    departureTime: '16:15',
    departureDate: todayStr,
    arrivalTime: '17:30',
    arrivalDate: todayStr,
    durationFormatted: '01g 15ph',
    price: 180000,
    availableSeatsCount: 7,
    totalSeats: 9,
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&q=80',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&q=80',
    ],
    tags: ['Xác nhận tức thì', 'Có thể hủy', 'Đón tận nhà', 'Trả tận nhà'],
    pickupPoints: mockStopPoints['TRIP-HN-NB-01'].pickup,
    dropoffPoints: mockStopPoints['TRIP-HN-NB-01'].dropoff,
  },
  {
    id: 'TRIP-HN-NB-02',
    tripCode: 'XV-1630',
    operator: {
      name: 'XeViet VIP Express',
      logoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&q=80',
      rating: 4.6,
      reviewCount: 92,
      amenities: ['Wifi tốc độ cao', 'Nước uống miễn phí', 'Cổng sạc USB', 'Điều hòa', 'Đón sảnh sân bay'],
      cancellationPolicy: 'Hủy trước 24 giờ hoàn 90% giá vé.',
    },
    busType: mockBusTypes[1], // Limousine giường nằm 22
    bus: mockBuses[2],
    route: mockRoutes[2],
    departureStation: mockStations[3], // Sân bay Nội Bài
    arrivalStation: mockStations[6],   // Thành phố Ninh Bình
    departureTime: '16:30',
    departureDate: todayStr,
    arrivalTime: '17:30',
    arrivalDate: todayStr,
    durationFormatted: '01g 00ph',
    price: 220000,
    availableSeatsCount: 19,
    totalSeats: 22,
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&q=80',
      'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=500&q=80',
    ],
    tags: ['Xác nhận tức thì', 'Có thể hủy', 'Đón sân bay'],
    pickupPoints: mockStopPoints['TRIP-HN-NB-02'].pickup,
    dropoffPoints: mockStopPoints['TRIP-HN-NB-02'].dropoff,
  },
  {
    id: 'TRIP-HN-NB-03',
    tripCode: 'XV-1720',
    operator: {
      name: 'XeViet Giường Nằm',
      logoUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=100&q=80',
      rating: 4.5,
      reviewCount: 312,
      amenities: ['Giường nằm êm ái', 'Wifi cực nhanh', 'Nước suối & Khăn ướt', 'Bảo hiểm hành khách'],
      cancellationPolicy: 'Miễn phí hủy trước 6 tiếng.',
    },
    busType: mockBusTypes[0], // Giường nằm 34
    bus: mockBuses[4],
    route: mockRoutes[1],
    departureStation: mockStations[2], // 72 Trần Nhân Tông
    arrivalStation: mockStations[5],   // VP 251 Lương Văn Thăng
    departureTime: '17:20',
    departureDate: todayStr,
    arrivalTime: '19:50',
    arrivalDate: todayStr,
    durationFormatted: '02g 30ph',
    price: 150000,
    availableSeatsCount: 33,
    totalSeats: 34,
    images: [
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&q=80',
    ],
    tags: ['Xác nhận tức thì', 'Có thể hủy', 'Trả tận nhà', 'Giá tiết kiệm'],
    pickupPoints: mockStopPoints['TRIP-HN-NB-03'].pickup,
    dropoffPoints: mockStopPoints['TRIP-HN-NB-03'].dropoff,
  },
  {
    id: 'TRIP-HN-NB-04',
    tripCode: 'XV-1750',
    operator: {
      name: 'XeViet Limousine',
      logoUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=100&q=80',
      rating: 4.9,
      reviewCount: 420,
      amenities: ['Ghế da cao cấp massage', 'Wifi 5G', 'Khăn lạnh, nước suối', 'Cổng sạc Type-C', 'Điều hòa lọc không khí'],
      cancellationPolicy: 'Miễn phí hủy trước 6 tiếng.',
    },
    busType: mockBusTypes[2], // Limousine 9 Chỗ
    bus: mockBuses[1],
    route: mockRoutes[1],
    departureStation: mockStations[2], // 72 Trần Nhân Tông
    arrivalStation: mockStations[5],   // VP 251 Lương Văn Thăng
    departureTime: '17:50',
    departureDate: todayStr,
    arrivalTime: '19:30',
    arrivalDate: todayStr,
    durationFormatted: '01g 40ph',
    price: 175000,
    availableSeatsCount: 7,
    totalSeats: 9,
    images: [
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&q=80',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&q=80',
    ],
    tags: ['Xác nhận tức thì', 'Có thể hủy', 'Đón tận nhà'],
    pickupPoints: mockStopPoints['TRIP-HN-NB-04'].pickup,
    dropoffPoints: mockStopPoints['TRIP-HN-NB-04'].dropoff,
  },
];

// ==========================================
// 11. SEAT LAYOUT VIEW CHO TỪNG XE (B5)
// ==========================================
export const mockSeatLayouts: Record<string, SeatLayoutView> = {
  'BUS-01': {
    busId: 'BUS-01',
    busTypeCode: 'BT-LIM-09',
    busTypeName: 'Xe Limousine 9 Chỗ',
    floors: 1,
    totalSeats: 9,
    layoutConfig: BUS_LAYOUT_CONFIGS['BT-LIM-09'],
    seats: generateBusSeats('BUS-01', 'BT-LIM-09'),
  },
  'BUS-02': {
    busId: 'BUS-02',
    busTypeCode: 'BT-LIM-09',
    busTypeName: 'Xe Limousine 9 Chỗ',
    floors: 1,
    totalSeats: 9,
    layoutConfig: BUS_LAYOUT_CONFIGS['BT-LIM-09'],
    seats: generateBusSeats('BUS-02', 'BT-LIM-09'),
  },
  'BUS-03': {
    busId: 'BUS-03',
    busTypeCode: 'BT-LIM-22',
    busTypeName: 'Xe Limousine Giường Nằm 22',
    floors: 2,
    totalSeats: 22,
    layoutConfig: BUS_LAYOUT_CONFIGS['BT-LIM-22'],
    seats: generateBusSeats('BUS-03', 'BT-LIM-22'),
  },
  'BUS-04': {
    busId: 'BUS-04',
    busTypeCode: 'BT-LIM-22',
    busTypeName: 'Xe Limousine Giường Nằm 22',
    floors: 2,
    totalSeats: 22,
    layoutConfig: BUS_LAYOUT_CONFIGS['BT-LIM-22'],
    seats: generateBusSeats('BUS-04', 'BT-LIM-22'),
  },
  'BUS-05': {
    busId: 'BUS-05',
    busTypeCode: 'BT-SLP-34',
    busTypeName: 'Xe Giường Nằm 34',
    floors: 2,
    totalSeats: 34,
    layoutConfig: BUS_LAYOUT_CONFIGS['BT-SLP-34'],
    seats: generateBusSeats('BUS-05', 'BT-SLP-34'),
  },
  'BUS-06': {
    busId: 'BUS-06',
    busTypeCode: 'BT-SLP-34',
    busTypeName: 'Xe Giường Nằm 34',
    floors: 2,
    totalSeats: 34,
    layoutConfig: BUS_LAYOUT_CONFIGS['BT-SLP-34'],
    seats: generateBusSeats('BUS-06', 'BT-SLP-34'),
  },
};

// ==========================================
// 12. BOOKINGS, TICKETS & PAYMENTS
// ==========================================
export const mockBookings: Booking[] = [
  {
    id: 'BK-001',
    bookingCode: 'XV-98425',
    customerId: 'USR-CUS-1',
    channel: BOOKING_CHANNELS.ONLINE,
    createdAt: `${todayStr}T16:20:00`,
    expiredAt: `${todayStr}T16:25:00`,
    totalAmount: 175000,
    status: BOOKING_STATUS.PENDING,
  },
  {
    id: 'BK-002',
    bookingCode: 'XV-74123',
    customerId: 'USR-CUS-2',
    channel: BOOKING_CHANNELS.ONLINE,
    createdAt: `${todayStr}T14:10:00`,
    expiredAt: `${todayStr}T14:15:00`,
    totalAmount: 360000,
    status: BOOKING_STATUS.CONFIRMED,
  },
];

export const mockTickets: Ticket[] = [
  {
    id: 'TCK-001',
    ticketCode: 'TCK-98425-01',
    bookingId: 'BK-001',
    tripId: 'TRIP-HN-NB-04',
    seatId: 'BUS-02-01',
    passengerName: 'Nguyễn Văn An',
    passengerPhone: '0988000111',
    price: 175000,
    status: TICKET_STATUS.BOOKED,
  },
  {
    id: 'TCK-002',
    ticketCode: 'TCK-74123-01',
    bookingId: 'BK-002',
    tripId: 'TRIP-HN-NB-01',
    seatId: 'BUS-01-01',
    passengerName: 'Trần Thị Mai',
    passengerPhone: '0987654321',
    price: 180000,
    status: TICKET_STATUS.CHECKED_IN,
  },
  {
    id: 'TCK-003',
    ticketCode: 'TCK-74123-02',
    bookingId: 'BK-002',
    tripId: 'TRIP-HN-NB-01',
    seatId: 'BUS-01-02',
    passengerName: 'Trần Thị Mai',
    passengerPhone: '0987654321',
    price: 180000,
    status: TICKET_STATUS.CHECKED_IN,
  },
];

export const mockPayments: Payment[] = [
  {
    id: 'PAY-001',
    bookingId: 'BK-001',
    method: PAYMENT_METHODS.BANK_TRANSFER,
    amount: 175000,
    paidAt: null,
    transactionCode: 'VQR-TX-98425',
    status: PAYMENT_STATUS.PENDING,
  },
  {
    id: 'PAY-002',
    bookingId: 'BK-002',
    method: PAYMENT_METHODS.BANK_TRANSFER,
    amount: 360000,
    paidAt: `${todayStr}T14:12:00`,
    transactionCode: 'VQR-TX-74123',
    status: PAYMENT_STATUS.SUCCESS,
  },
];

// Chi tiết thanh toán mặc định
export const mockBookingCheckoutView: BookingCheckoutView = {
  bookingId: 'BK-001',
  bookingCode: 'XV-98425',
  trip: mockTripCardViews[3],
  selectedSeats: [
    {
      id: 'BUS-02-01',
      label: '01',
      floor: 1,
      row: 1,
      col: 2,
      zone: 'purple',
      status: 'AVAILABLE',
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
    name: 'VP 251 Lương Văn Thăng (XeViet Ninh Bình)',
    address: 'VP 251 Lương Văn Thăng, Ninh Bình',
    time: '19:30',
    type: 'DROPOFF',
  },
  passenger: {
    fullName: 'Nguyễn Văn An',
    phone: '0988000111',
    email: 'nva@example.com',
  },
  totalAmount: 175000,
  totalOriginalAmount: 175000,
  discountAmount: 0,
  finalAmount: 175000,
  payment: {
    bankName: VIETQR_CONFIG.DEFAULT_BANK,
    bankBin: VIETQR_CONFIG.BANK_BIN,
    accountNumber: VIETQR_CONFIG.ACCOUNT_NUMBER,
    accountName: VIETQR_CONFIG.ACCOUNT_NAME,
    amount: 175000,
    transferContent: 'XEVIET XV-98425',
    qrImageUrl: `https://img.vietqr.io/image/${VIETQR_CONFIG.BANK_BIN}-${VIETQR_CONFIG.ACCOUNT_NUMBER}-compact2.png?amount=175000&addInfo=XEVIET%20XV-98425&accountName=${encodeURIComponent(VIETQR_CONFIG.ACCOUNT_NAME)}`,
    countdownSeconds: VIETQR_CONFIG.DEFAULT_COUNTDOWN_SECONDS,
  },
};

// ==========================================
// 13. HELPER FUNCTIONS FOR CLIENT APPLICATION
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
