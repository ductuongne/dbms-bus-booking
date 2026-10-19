// ==========================================
// TYPES THEO CHUẨN DATABASE SCHEMA (01_schema.sql)
// ==========================================

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
} from '../constants';

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type BusStatus = (typeof BUS_STATUS)[keyof typeof BUS_STATUS];
export type SeatType = (typeof SEAT_TYPES)[keyof typeof SEAT_TYPES];
export type TripStatus = (typeof TRIP_STATUS)[keyof typeof TRIP_STATUS];
export type BookingChannel = (typeof BOOKING_CHANNELS)[keyof typeof BOOKING_CHANNELS];
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

// 1. Table: users
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash?: string | null;
  role: UserRole;
  loyaltyPoints: number;
  isActive: boolean;
}

// 2. Table: provinces
export interface Province {
  id: string;
  name: string;
}

// 3. Table: stations
export interface Station {
  id: string;
  name: string;
  provinceId: string;
  address: string;
}

// 4. Table: routes
export interface Route {
  id: string;
  departureStationId: string;
  arrivalStationId: string;
  distanceKm: number;
  estimatedDuration: number; // Thời gian ước tính (phút)
}

// 5. Table: bus_types
export interface BusType {
  id: string;
  name: string;
  totalSeats: number;
  floors: number;
}

// 6. Table: buses
export interface Bus {
  id: string;
  licensePlate: string;
  typeId: string;
  status: BusStatus;
}

// 7. Table: seats
export interface Seat {
  id: string;
  seatNumber: string;
  floor: number;
  seatType: SeatType;
  busId: string;
}

// 8. Table: drivers
export interface Driver {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseExpiry: string; // ISO date YYYY-MM-DD
}

// 9. Table: trips
export interface Trip {
  id: string;
  routeId: string;
  busId: string;
  driverId: string;
  departureTime: string; // ISO DateTime
  arrivalTime: string; // ISO DateTime
  price: number;
  status: TripStatus;
}

// 10. Table: bookings
export interface Booking {
  id: string;
  bookingCode: string;
  customerId: string;
  channel: BookingChannel;
  createdAt: string;
  expiredAt: string;
  totalAmount: number;
  status: BookingStatus;
}

// 11. Table: payments
export interface Payment {
  id: string;
  bookingId: string;
  method: PaymentMethod;
  amount: number;
  paidAt?: string | null;
  transactionCode?: string | null;
  status: PaymentStatus;
}

// 12. Table: tickets
export interface Ticket {
  id: string;
  ticketCode: string;
  bookingId: string;
  tripId: string;
  seatId: string;
  passengerName: string;
  passengerPhone: string;
  price: number;
  status: TicketStatus;
}

// ==========================================
// DTOs & VIEW MODELS PHỤC VỤ GIAO DIỆN CLIENT
// ==========================================

export type SeatState = 'AVAILABLE' | 'BOOKED' | 'SELECTED';

export interface StopPointView {
  id: string;
  name: string;
  address: string;
  time: string; // e.g. "17:50"
  type: 'PICKUP' | 'DROPOFF';
}

export interface SeatItemView extends Seat {
  row: number;
  col: number;
  status: SeatState;
  price: number;
}

export interface SeatLayoutView {
  busId: string;
  busTypeName: string;
  floors: number;
  totalSeats: number;
  driverSeatPosition: { floor: number; row: number; col: number };
  seats: SeatItemView[];
}

export interface OperatorInfo {
  name: string;
  logoUrl?: string;
  rating: number; // e.g. 4.2
  reviewCount: number;
  amenities: string[];
  cancellationPolicy: string;
}

export interface TripCardView {
  id: string;
  tripCode: string;
  operator: OperatorInfo;
  busType: BusType;
  bus: Bus;
  route: Route;
  departureStation: Station;
  arrivalStation: Station;
  departureTime: string; // "16:15"
  departureDate: string; // "2026-10-18"
  arrivalTime: string; // "17:30"
  arrivalDate: string; // "2026-10-18"
  durationFormatted: string; // "01g 15ph"
  price: number;
  availableSeatsCount: number;
  totalSeats: number;
  images: string[];
  tags: string[]; // ["Xác nhận tức thì", "Có thể hủy", "Đón tận nhà", "Trả tận nhà"]
  pickupPoints: StopPointView[];
  dropoffPoints: StopPointView[];
}

export interface SearchTripParams {
  originProvinceId: string;
  destinationProvinceId: string;
  departureDate: string; // YYYY-MM-DD
}

export interface SearchFilterState {
  timeSlots: string[];
  busTypeIds: string[];
  pickupStationIds: string[];
  dropoffStationIds: string[];
  maxPrice?: number;
  sortBy?: 'DEPARTURE_EARLIEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING_DESC';
}

export interface PromotionCardView {
  id: string;
  code: string;
  title: string;
  description: string;
  discountBadge: string; // e.g. "Giảm đến 40%" hoặc "Tiết kiệm 30%"
  expiryText: string; // e.g. "Hạn sử dụng đến 31 Th3"
  bannerUrl?: string;
  accentColor?: string;
}

export interface VietQrPaymentView {
  bankName: string;
  bankBin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  transferContent: string;
  qrImageUrl: string;
  countdownSeconds: number;
}

export interface BookingCheckoutView {
  bookingId: string;
  bookingCode: string;
  trip: TripCardView;
  selectedSeats: SeatItemView[];
  pickupPoint: StopPointView;
  dropoffPoint: StopPointView;
  passenger: {
    fullName: string;
    phone: string;
    email: string;
  };
  totalOriginalAmount: number;
  discountAmount: number;
  finalAmount: number;
  payment: VietQrPaymentView;
}

// ==========================================
// FLEET, ROUTE & STATION MANAGEMENT TYPES
// ==========================================
export interface RouteStation {
  id: string;
  routeId: string;
  stationId: string;
  stopOrder: number;
}

export interface RouteStopView {
  id: string;
  routeId: string;
  stationId: string;
  stationName: string;
  address: string;
  provinceName: string;
  stopOrder: number;
}

export interface RouteDetailView {
  id: string;
  departureStationId: string;
  departureStationName: string;
  departureProvinceId: string;
  departureProvince: string;
  arrivalStationId: string;
  arrivalStationName: string;
  arrivalProvinceId: string;
  arrivalProvince: string;
  distanceKm: number;
  estimatedDuration: number;
  stops: RouteStopView[];
}

export interface BusListItemView {
  id: string;
  licensePlate: string;
  typeId: string;
  typeName: string;
  totalSeats: number;
  floors: number;
  status: BusStatus;
}

export interface BusDetailView extends BusListItemView {
  seats: {
    id: string;
    seatNumber: string;
    floor: number;
    seatType: SeatType;
    busId: string;
  }[];
}

export interface StationDetailView {
  id: string;
  name: string;
  provinceId: string;
  provinceName: string;
  address: string;
}

