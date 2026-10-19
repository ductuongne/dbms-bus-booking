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

  getBookingByCode: (bookingCode: string): Promise<Record<string, unknown>> => {
    return api.get(`/bookings/lookup/${bookingCode}`);
  },
};

export default bookingService;
