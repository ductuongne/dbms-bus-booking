import React from 'react';
import { Search, CheckCircle } from 'lucide-react';
import type { BookingLookupResponse } from '../../../../services/booking.service';
import { Button, Badge } from '../../../../components/common';
import { formatCurrency, formatDateTime } from '../../../../utils';

export interface BookingLookupSectionProps {
  bookingCodeInput: string;
  onBookingCodeChange: (value: string) => void;
  onSearch: (code?: string) => void;
  isSearching: boolean;
  lookupResult: BookingLookupResponse | null;
  onCheckIn: (ticketCode: string) => void;
}

export const BookingLookupSection: React.FC<BookingLookupSectionProps> = ({
  bookingCodeInput,
  onBookingCodeChange,
  onSearch,
  isSearching,
  lookupResult,
  onCheckIn,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const getTicketStatusBadge = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return <Badge variant="brand">Đã xuất vé</Badge>;
      case 'CHECKED_IN':
        return <Badge variant="success">Đã lên xe (Check-in)</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Đã hủy</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Chờ thanh toán</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Nhập mã đặt vé (Booking Code, VD: BK-20261019-XXXX)..."
            value={bookingCodeInput}
            onChange={(e) => onBookingCodeChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:bg-white transition-all font-mono"
            required
          />
        </div>
        <Button variant="primary" size="sm" type="submit" isLoading={isSearching}>
          Tìm kiếm
        </Button>
      </form>

      {lookupResult && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">
                  Đơn hàng: {lookupResult.booking.booking_code}
                </span>
                <Badge variant={lookupResult.booking.status === 'CONFIRMED' ? 'success' : 'warning'}>
                  {lookupResult.booking.status}
                </Badge>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Tạo lúc: {formatDateTime(lookupResult.booking.created_at)} • Kênh:{' '}
                {lookupResult.booking.channel}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500">Tổng thanh toán</span>
              <div className="text-lg font-bold text-[#C2410C]">
                {formatCurrency(lookupResult.booking.total_amount)}
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Mã vé</th>
                  <th className="py-2.5 px-4">Hành khách</th>
                  <th className="py-2.5 px-4">Số điện thoại</th>
                  <th className="py-2.5 px-4">Số ghế</th>
                  <th className="py-2.5 px-4">Giá vé</th>
                  <th className="py-2.5 px-4">Trạng thái</th>
                  <th className="py-2.5 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lookupResult.tickets.map((t) => (
                  <tr key={t.ticket_id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {t.ticket_code}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{t.passenger_name}</td>
                    <td className="py-3 px-4 text-slate-600">{t.passenger_phone}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold text-xs">
                        Ghế {t.seat_number}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {formatCurrency(t.price)}
                    </td>
                    <td className="py-3 px-4">{getTicketStatusBadge(t.status)}</td>
                    <td className="py-3 px-4 text-right">
                      {t.status === 'ISSUED' && (
                        <Button
                          variant="action"
                          size="sm"
                          onClick={() => onCheckIn(t.ticket_code)}
                          icon={<CheckCircle className="w-3.5 h-3.5" />}
                        >
                          Check-in
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingLookupSection;
