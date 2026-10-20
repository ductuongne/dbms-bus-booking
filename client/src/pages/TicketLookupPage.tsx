import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Ticket,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { bookingService, type BookingLookupResponse } from '../services/booking.service';
import { Card, Button, Badge } from '../components/common';
import { formatCurrency } from '../utils';

export const TicketLookupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const navigate = useNavigate();

  const [bookingCode, setBookingCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingLookupResponse | null>(null);

  const handleSearch = async (codeToSearch?: string) => {
    const code = (codeToSearch || bookingCode).trim().toUpperCase();
    if (!code) {
      setError('Vui lòng nhập mã đơn đặt vé (VD: BKG10001)!');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await bookingService.getBookingByCode(code);
      setResult(data);
    } catch (err: unknown) {
      setResult(null);
      setError(
        err instanceof Error
          ? err.message
          : 'Không tìm thấy thông tin đơn đặt vé với mã đã cung cấp. Vui lòng kiểm tra lại!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="success" size="md">Đã thanh toán &amp; Xác nhận</Badge>;
      case 'CHECKED_IN':
        return <Badge variant="brand" size="md">Đã lên xe (Check-in)</Badge>;
      case 'PENDING':
        return <Badge variant="warning" size="md">Chờ thanh toán</Badge>;
      case 'EXPIRED':
        return <Badge variant="default" size="md">Hết hạn thanh toán</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger" size="md">Đã hủy</Badge>;
      default:
        return <Badge variant="default" size="md">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-left">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Tra cứu thông tin vé &amp; Đơn hàng
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Nhập mã đơn đặt vé (Booking Code) được gửi qua tin nhắn hoặc email để kiểm tra trạng thái vé và chi tiết hành trình.
        </p>
      </div>

      {/* Search Input Box */}
      <Card padding="md" className="shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSearch();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Nhập mã đặt vé (VD: BKG10001, BKG20001)..."
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent font-mono tracking-wider uppercase bg-slate-50/50"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading || !bookingCode.trim()}
            icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          >
            Tra cứu vé
          </Button>
        </form>
      </Card>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-900 text-xs flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Result Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Thông tin đơn hàng */}
          <Card padding="lg" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Mã đơn đặt vé
                </span>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <h2 className="text-xl font-mono font-black text-slate-900">
                    {result.booking.booking_code}
                  </h2>
                  {getStatusBadge(result.booking.status)}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 font-medium">Tổng tiền thanh toán</span>
                <div className="text-xl font-black text-[#C2410C]">
                  {formatCurrency(result.booking.total_amount)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
              <div>
                <span className="text-slate-400 block font-medium">Kênh đặt vé:</span>
                <span className="font-semibold text-slate-800 uppercase mt-0.5 block">
                  {result.booking.channel === 'ONLINE' ? 'Trực tuyến (Website)' : 'Tại quầy vé'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Thời gian đặt vé:</span>
                <span className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(result.booking.created_at).toLocaleString('vi-VN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Hạn thanh toán:</span>
                <span className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(result.booking.expired_at).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Quick Pay action if PENDING */}
            {result.booking.status === 'PENDING' && (
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/60 -mx-6 -mb-6 p-4 rounded-b-2xl">
                <div className="text-xs text-amber-900">
                  <span className="font-bold">Đơn hàng đang chờ thanh toán!</span>
                  <p className="text-amber-700 mt-0.5">Vui lòng thanh toán trước hạn để giữ vé an toàn.</p>
                </div>
                <Button
                  variant="action"
                  size="sm"
                  icon={<CreditCard className="w-4 h-4" />}
                  onClick={() =>
                    navigate(
                      `/payment?bookingId=${result.booking.booking_id}&code=${result.booking.booking_code}&amount=${result.booking.total_amount}`
                    )
                  }
                >
                  Thanh toán ngay <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            )}
          </Card>

          {/* Danh sách vé chi tiết */}
          <Card padding="none">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E3A5F] flex items-center justify-center shrink-0">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Danh sách vé hành khách ({result.tickets.length} vé)
                  </h3>
                  <p className="text-[11px] text-slate-500">Mỗi hành khách sở hữu một mã vé điện tử riêng biệt</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="px-5 py-3">Mã vé</th>
                    <th className="px-5 py-3">Số ghế</th>
                    <th className="px-5 py-3">Hành khách</th>
                    <th className="px-5 py-3">Số điện thoại</th>
                    <th className="px-5 py-3 text-right">Giá vé</th>
                    <th className="px-5 py-3 text-center">Trạng thái vé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.tickets.map((t) => (
                    <tr key={t.ticket_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-slate-900">
                        {t.ticket_code}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-[#1E3A5F] font-black text-xs">
                          {t.seat_number || t.seat_id}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-900">
                        {t.passenger_name}
                      </td>
                      <td className="px-5 py-3 text-slate-600 font-mono">
                        {t.passenger_phone}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-slate-900">
                        {formatCurrency(t.price)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {t.status === 'CHECKED_IN' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Đã lên xe
                          </span>
                        ) : t.status === 'CONFIRMED' || t.status === 'ISSUED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                            Hợp lệ
                          </span>
                        ) : (
                          <Badge variant="default" size="sm">{t.status}</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TicketLookupPage;
