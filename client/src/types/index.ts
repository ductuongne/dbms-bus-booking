import React from 'react';
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

// ==========================================
// 1. DATABASE ENTITIES (01_schema.sql)
// ==========================================

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

export interface Province {
  id: string;
  name: string;
}

export interface Station {
  id: string;
  name: string;
  provinceId: string;
  address: string;
}

export interface Route {
  id: string;
  departureStationId: string;
  arrivalStationId: string;
  distanceKm: number;
  estimatedDuration: number; // Phút
}

export interface BusType {
  id: string;
  name: string;
  totalSeats: number;
  floors: number;
}

export interface Bus {
  id: string;
  licensePlate: string;
  typeId: string;
  status: BusStatus;
}

export interface Seat {
  id: string;
  seatNumber: string;
  floor: number;
  seatType: SeatType;
  busId: string;
}

export interface Driver {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseExpiry: string; // ISO date YYYY-MM-DD
}

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

export interface Payment {
  id: string;
  bookingId: string;
  method: PaymentMethod;
  amount: number;
  paidAt?: string | null;
  transactionCode?: string | null;
  status: PaymentStatus;
}

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
// 2. VIEW MODELS & CLIENT DTOs
// ==========================================

export type SeatStatus = 'AVAILABLE' | 'HELD' | 'BOOKED';
export type SeatZone = 'blue' | 'purple' | 'amber' | 'green';

export interface SeatCell {
  id: string;
  label: string;        // "A03", "B11", "07"
  seatNumber?: string;  // tương thích tạm
  floor: 1 | 2;         // 1 = tầng A, 2 = tầng B
  row: number;          // bắt đầu từ 1
  col: number;          // bắt đầu từ 1
  zone: SeatZone;       // màu viền nhóm ghế
  status: SeatStatus;
  price: number;
}

export type SeatItemView = SeatCell;

export interface BusLayoutConfig {
  busTypeCode: string;
  name: string;
  floors: 1 | 2;
  cols: number;
  rows: number;
  showFloorPrefix: boolean; // true: A/B, false: 01-09
  driver?: { floor: 1; row: number; col: number }; // row 0 là hàng trên hàng đầu
}

export interface SeatLayoutView {
  busId: string;
  busTypeCode: string;
  busTypeName: string;
  floors: 1 | 2;
  totalSeats: number;
  layoutConfig: BusLayoutConfig;
  seats: SeatCell[];
}

export interface StopPointView {
  id: string;
  name: string;
  address: string;
  time: string; // "17:50"
  type: 'PICKUP' | 'DROPOFF';
}

export interface OperatorInfo {
  name: string;
  logoUrl?: string;
  rating: number;
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
  departureDate: string; // "YYYY-MM-DD"
  arrivalTime: string; // "17:30"
  arrivalDate: string; // "YYYY-MM-DD"
  durationFormatted: string; // "01g 15ph"
  price: number;
  availableSeatsCount: number;
  totalSeats: number;
  images: string[];
  tags: string[];
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
  selectedSeats: SeatCell[];
  pickupPoint: StopPointView;
  dropoffPoint: StopPointView;
  passenger: {
    fullName: string;
    phone: string;
    email: string;
  };
  totalAmount?: number;
  totalOriginalAmount: number;
  discountAmount: number;
  finalAmount: number;
  payment: VietQrPaymentView;
}

// Common UI Table & Auth types
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface TableColumn<T> {
  key: string;
  title: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}
