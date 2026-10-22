import React from 'react';
import { Search, CheckCircle, Phone, Ticket, User, MapPin, AlertCircle } from 'lucide-react';
import type { BookingLookupResponse } from '../../../../services/booking.service';
import { Button, Badge } from '../../../../components/common';
import { formatCurrency, formatDateTime } from '../../../../utils';

export interface BookingLookupSectionProps {
  searchMode: 'code' | 'phone';
  onSearchModeChange: (mode: 'code' | 'phone') => void;
  bookingCodeInput: string;
  onBookingCodeChange: (value: string) => void;
  phoneInput: string;
  onPhoneChange: (value: string) => void;
  onSearch: (code?: string, phone?: string) => void;
  isSearching: boolean;
  lookupResults: BookingLookupResponse[];
  selectedBookingCode: string;
  onSelectBookingCode: (code: string) => void;
  onCheckIn: (ticketCode: string) => void;
}

export const BookingLookupSection: React.FC<BookingLookupSectionProps> = ({
  searchMode,
  onSearchModeChange,
  bookingCodeInput,
  onBookingCodeChange,
  phoneInput,
  onPhoneChange,
  onSearch,
  isSearching,
  lookupResults,
  selectedBookingCode,
  onSelectBookingCode,
  onCheckIn,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const getTicketStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="brand">Đã xác nhận</Badge>;
      case 'ISSUED':
        return <Badge variant="brand">Đã xuất vé</Badge>;
      case 'CHECKED_IN':
        return <Badge variant="success">Đã lên xe</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Đã hủy</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Chờ thanh toán</Badge>;
      case 'EXPIRED':
        return <Badge variant="neutral">Hết hạn</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="success">Đã xác nhận</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Chờ thanh toán</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Đã hủy</Badge>;
      case 'EXPIRED':
        return <Badge variant="neutral">Hết hạn</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const currentBooking =
    lookupResults.find((r) => r.booking.booking_code === selectedBookingCode) ||
    lookupResults[0] ||
    null;

  return (
    <div className="space-y-6">
      {/* Mode Switcher & Search Form */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">
            Phương thức tra cứu:
          </span>
          <button
            type="button"
            onClick={() => onSearchModeChange('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              searchMode === 'code'
                ? 'bg-[#1E3A5F] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Theo Mã đặt vé</span>
          </button>

          <button
            type="button"
            onClick={() => onSearchModeChange('phone')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              searchMode === 'phone'
                ? 'bg-[#1E3A5F] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Theo Số điện thoại</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            {searchMode === 'code' ? (
              <>
                <Ticket className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nhập mã đặt vé (Booking Code, VD: BK-20261019-XXXX)..."
                  value={bookingCodeInput}
                  onChange={(e) => onBookingCodeChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:bg-white transition-all font-mono"
                  required
                />
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại khách hàng hoặc hành khách (VD: 0901234567)..."
                  value={phoneInput}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:bg-white transition-all"
                  required
                />
              </>
            )}
          </div>
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={isSearching}
            icon={<Search className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Tra cứu đơn
          </Button>
        </form>
      </div>

      {/* Multiple Bookings Tabs when searching by Phone */}
      {searchMode === 'phone' && lookupResults.length > 1 && (
        <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Tìm thấy {lookupResults.length} đơn đặt vé cho SĐT: <span className="font-mono text-[#1E3A5F]">{phoneInput}</span>
            </span>
            <span className="text-xs text-slate-500">Chọn đơn vé để xem chi tiết</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {lookupResults.map((item, idx) => {
              const isSelected = item.booking.booking_code === currentBooking?.booking.booking_code;
              return (
                <button
                  key={item.booking.booking_id || item.booking.booking_code}
                  type="button"
                  onClick={() => onSelectBookingCode(item.booking.booking_code)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#1E3A5F] text-[#1E3A5F] shadow-xs ring-1 ring-[#1E3A5F]'
                      : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="font-mono font-semibold">#{idx + 1} {item.booking.booking_code}</span>
                  <span className="text-slate-400">•</span>
                  <span>{item.tickets.length} vé</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-[#C2410C]">{formatCurrency(item.booking.total_amount)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Booking Details Card */}
      {currentBooking && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/60">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg">
                  Đơn đặt vé: {currentBooking.booking.booking_code}
                </span>
                {getBookingStatusBadge(currentBooking.booking.status)}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
                <span>
                  Tạo lúc: {formatDateTime(currentBooking.booking.created_at)}
                </span>
                <span>•</span>
                <span>
                  Kênh: <strong className="text-slate-700">{currentBooking.booking.channel}</strong>
                </span>

                {currentBooking.booking.customer_name && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{currentBooking.booking.customer_name}</span>
                      {currentBooking.booking.customer_phone && (
                        <span className="text-slate-400">({currentBooking.booking.customer_phone})</span>
                      )}
                    </span>
                  </>
                )}
              </div>

              {currentBooking.booking.trip_summary?.route_name && (
                <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1E3A5F]" />
                  <span className="font-medium text-[#1E3A5F]">
                    {currentBooking.booking.trip_summary.route_name}
                  </span>
                  {currentBooking.booking.trip_summary.departure_time && (
                    <span className="text-slate-400">
                      ({formatDateTime(currentBooking.booking.trip_summary.departure_time)})
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
              <span className="text-xs text-slate-500 block">Tổng thanh toán</span>
              <div className="text-lg sm:text-xl font-bold text-[#C2410C]">
                {formatCurrency(currentBooking.booking.total_amount)}
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
                  <th className="py-2.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentBooking.tickets.map((t) => (
                  <tr key={t.ticket_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {t.ticket_code}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{t.passenger_name}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{t.passenger_phone}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold text-xs">
                        Ghế {t.seat_number}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {formatCurrency(t.price)}
                    </td>
                    <td className="py-3 px-4">{getTicketStatusBadge(t.status)}</td>
                    <td className="py-3 px-4 text-right">
                      {['CONFIRMED', 'ISSUED'].includes(t.status) && (
                        <Button
                          variant="action"
                          size="sm"
                          onClick={() => onCheckIn(t.ticket_code)}
                          icon={<CheckCircle className="w-3.5 h-3.5" />}
                        >
                          Check-in
                        </Button>
                      )}

                      {t.status === 'CHECKED_IN' && (
                        <span className="text-xs text-emerald-600 font-medium inline-flex items-center gap-1 justify-end">
                          <CheckCircle className="w-3.5 h-3.5" /> Đã lên xe
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State when no results found */}
      {!currentBooking && !isSearching && (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
          <AlertCircle className="w-10 h-10 mx-auto stroke-1 mb-2 opacity-50" />
          <p className="text-sm font-medium text-slate-600">Chưa có kết quả tra cứu</p>
          <p className="text-xs text-slate-400 mt-1">
            Vui lòng nhập Mã đặt vé hoặc Số điện thoại của khách hàng ở trên để tìm kiếm đơn đặt vé
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingLookupSection;
