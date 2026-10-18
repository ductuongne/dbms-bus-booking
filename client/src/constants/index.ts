// Hằng số nghiệp vụ đặt vé xe khách theo Database Schema & UI RedBus

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
  PRIMARY: '#FF385C', // Màu đỏ phong cách Airbnb / RedBus
  PRIMARY_HOVER: '#E00B41',
  PRIMARY_LIGHT: '#FFF1F3',
  ACCENT_GREEN: '#00A699',
  TEXT_MAIN: '#1F2937',
  TEXT_MUTED: '#6B7280',
  BORDER: '#E5E7EB',
  BG_PAGE: '#F9FAFB',
} as const;

// Khung giờ khởi hành dùng cho bộ lọc
export const TIME_SLOT_FILTERS = [
  { id: 'SLOT_06_12', label: '06:00 - 12:00', startHour: 6, endHour: 12 },
  { id: 'SLOT_12_18', label: '12:00 - 18:00', startHour: 12, endHour: 18 },
  { id: 'SLOT_18_24', label: '18:00 - 24:00', startHour: 18, endHour: 24 },
  { id: 'SLOT_00_06', label: '00:00 - 06:00', startHour: 0, endHour: 6 },
] as const;

// Thông tin mặc định cổng thanh toán VietQR
export const VIETQR_CONFIG = {
  DEFAULT_BANK: 'VPBank',
  BANK_BIN: '970432', // VPBank BIN
  ACCOUNT_NUMBER: '1988668899',
  ACCOUNT_NAME: 'CONG TY CP DAT VE XE KHACH',
  DEFAULT_COUNTDOWN_SECONDS: 300, // 5 phút giữ chỗ
} as const;
