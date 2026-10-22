// Hằng số nghiệp vụ đặt vé xe khách theo Database Schema & UI Daisy Booking

export const BRAND_INFO = {
  name: 'Daisy Booking',
  slogan: 'Đặt vé xe khách & Limousine trực tuyến',
  hotline: '1900 xxxx',
  email: 'hotro@daisy.vn',
  address: 'Hà Nội, Việt Nam',
} as const;

export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
  DRIVER: 'DRIVER',
  GUEST: 'GUEST',
} as const;

export const BUS_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export const SEAT_TYPES = {
  NORMAL: 'NORMAL',
  VIP: 'VIP',
  SLEEPER: 'SLEEPER',
} as const;

export const TRIP_STATUS = {
  SCHEDULED: 'SCHEDULED',
  DEPARTED: 'DEPARTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const BOOKING_CHANNELS = {
  ONLINE: 'ONLINE',
  COUNTER: 'COUNTER',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
} as const;

export const PAYMENT_METHODS = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const;

export const TICKET_STATUS = {
  BOOKED: 'BOOKED',
  CHECKED_IN: 'CHECKED_IN',
  CANCELLED: 'CANCELLED',
} as const;

// Hằng số giao diện & UI/UX
export const BRAND_COLORS = {
  BRAND: '#1E3A5F',
  BRAND_HOVER: '#162C48',
  BRAND_LIGHT: '#EFF6FF',
  SURFACE: '#FFFFFF',
  BG: '#F8FAFC',
  BORDER: '#E2E8F0',
  TEXT_MAIN: '#0F172A',
  TEXT_MUTED: '#64748B',
  ACTION: '#C2410C',
  ACTION_HOVER: '#9A3412',
  SUCCESS: '#16A34A',
  ERROR: '#DC2626',
  WARNING: '#D97706',
} as const;

// Khung giờ khởi hành dùng cho bộ lọc
export const TIME_SLOT_FILTERS = [
  { id: 'SLOT_06_12', label: '06:00 - 12:00', startHour: 6, endHour: 12 },
  { id: 'SLOT_12_18', label: '12:00 - 18:00', startHour: 12, endHour: 18 },
  { id: 'SLOT_18_24', label: '18:00 - 24:00', startHour: 18, endHour: 24 },
  { id: 'SLOT_00_06', label: '00:00 - 06:00', startHour: 0, endHour: 6 },
] as const;

// Cấu hình sơ đồ 3 loại xe theo chuẩn thiết kế B5
export const BUS_LAYOUT_CONFIGS = {
  'BT-SLP-34': {
    busTypeCode: 'BT-SLP-34',
    name: 'Xe Giường Nằm 34',
    floors: 2,
    cols: 3,
    rows: 6,
    totalSeats: 34,
    showFloorPrefix: true,
  },
  'BT-LIM-22': {
    busTypeCode: 'BT-LIM-22',
    name: 'Xe Limousine Giường Nằm 22',
    floors: 2,
    cols: 2,
    rows: 6,
    totalSeats: 22,
    showFloorPrefix: true,
    driver: { floor: 1, row: 0, col: 1 },
  },
  'BT-LIM-09': {
    busTypeCode: 'BT-LIM-09',
    name: 'Xe Limousine 9 Chỗ',
    floors: 1,
    cols: 3,
    rows: 4,
    totalSeats: 9,
    showFloorPrefix: false,
    driver: { floor: 1, row: 1, col: 1 },
  },
} as const;

// Thông tin cổng thanh toán VietQR lấy từ biến môi trường (.env) kèm fallback an toàn
export const VIETQR_CONFIG = {
  DEFAULT_BANK: import.meta.env.VITE_VIETQR_DEFAULT_BANK || 'MB Bank',
  BANK_BIN: import.meta.env.VITE_VIETQR_BANK_BIN || '970422',
  ACCOUNT_NUMBER: import.meta.env.VITE_VIETQR_ACCOUNT_NUMBER || '0901234567',
  ACCOUNT_NAME: import.meta.env.VITE_VIETQR_ACCOUNT_NAME || 'CONG TY CP DAISY BOOKING',
  DEFAULT_COUNTDOWN_SECONDS: Number(import.meta.env.VITE_VIETQR_COUNTDOWN_SECONDS || 900),
} as const;
