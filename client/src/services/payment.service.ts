import api from './api';

export interface PaymentRecord {
  payment_id: string;
  booking_id: string;
  method: 'CASH' | 'BANK_TRANSFER';
  amount: number;
  paid_at: string | null;
  transaction_code: string | null;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

export interface PayBookingPayload {
  booking_code: string;
  phone: string;
  method: 'CASH' | 'BANK_TRANSFER';
  transaction_code?: string;
}

export interface PaymentLookupResponse {
  booking_code: string;
  payment_status: string;
  total_paid: number;
  payments: PaymentRecord[];
}

export const paymentService = {
  payBooking: (bookingId: string, payload: PayBookingPayload): Promise<PaymentRecord> => {
    return api.post<PaymentRecord>(`/payments/${bookingId}/pay`, payload);
  },

  lookupPayments: (bookingCode: string, phone: string): Promise<PaymentLookupResponse> => {
    return api.get<PaymentLookupResponse>(`/payments/lookup/${bookingCode}`, { phone });
  },
};

export default paymentService;
