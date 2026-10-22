import api from './api';

export interface PassengerInput {
  seat_id: string;
  name: string;
  phone: string;
}

export interface HoldBookingPayload {
  customer_id?: string;
  trip_id: string;
  passengers: PassengerInput[];
  channel?: 'ONLINE' | 'COUNTER';
  email?: string;
}

export interface TicketResponse {
  ticket_id: string;
  ticket_code: string;
  seat_id: string;
  passenger_name: string;
  price: number;
  status: string;
}

export interface HoldBookingResponse {
  booking_id: string;
  booking_code: string;
  expired_at: string;
  total_amount: number;
  tickets: TicketResponse[];
}

export interface ConfirmBookingPayload {
  booking_code: string;
  phone: string;
  payment_method?: 'CASH' | 'BANK_TRANSFER';
}

export interface ConfirmBookingResponse {
  booking: {
    booking_id: string;
    booking_code: string;
    channel: string;
    created_at: string;
    expired_at: string;
    total_amount: number;
    status: string;
  };
  tickets: TicketResponse[];
}

export interface CancelBookingPayload {
  booking_code: string;
  phone: string;
  ticket_id?: string;
}

export interface StaffTicketItem {
  ticket_id: string;
  ticket_code: string;
  seat_id: string;
  seat_number: string;
  passenger_name: string;
  passenger_phone: string;
  price: number;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | 'PENDING' | 'EXPIRED' | 'ISSUED';
}

export interface BookingLookupResponse {
  booking: {
    booking_id: string;
    booking_code: string;
    customer_id: string;
    customer_name?: string;
    customer_phone?: string;
    channel: string;
    created_at: string;
    expired_at: string;
    total_amount: number;
    status: string;
    trip_summary?: {
      departure_time?: string;
      route_name?: string;
    };
  };
  tickets: StaffTicketItem[];
}

export const bookingService = {
  holdBooking: (payload: HoldBookingPayload): Promise<HoldBookingResponse> => {
    return api.post<HoldBookingResponse>('/bookings/hold', payload);
  },

  confirmBooking: (
    bookingId: string,
    payload: ConfirmBookingPayload
  ): Promise<ConfirmBookingResponse> => {
    return api.post<ConfirmBookingResponse>(`/bookings/${bookingId}/confirm`, payload);
  },

  cancelBooking: (
    bookingId: string,
    payload: CancelBookingPayload
  ): Promise<{ message: string }> => {
    return api.post<{ message: string }>(`/bookings/${bookingId}/cancel`, payload);
  },

  getBookingByCode: (bookingCode: string): Promise<BookingLookupResponse> => {
    return api.get<BookingLookupResponse>(`/bookings/lookup/${bookingCode}`);
  },

  getBookingsByPhone: (phone: string): Promise<BookingLookupResponse[]> => {
    return api.get<BookingLookupResponse[]>(`/bookings/by-phone/${encodeURIComponent(phone.trim())}`);
  },

  getTripTickets: (tripId: string, status?: string): Promise<StaffTicketItem[]> => {
    return api.get<StaffTicketItem[]>(`/bookings/trips/${tripId}/tickets`, { status });
  },

  checkInTicket: (ticketCode: string): Promise<{
    ticket_id: string;
    ticket_code: string;
    seat_id: string;
    passenger_name: string;
    passenger_phone: string;
    status: string;
  }> => {
    return api.post('/bookings/check-in', { ticket_code: ticketCode });
  },
};

export default bookingService;
