import React, { useEffect, useState } from 'react';
import {
  Ticket,
  Search,
  CheckCircle,
  QrCode,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import {
  bookingService,
  type BookingLookupResponse,
  type StaffTicketItem,
} from '../../services/booking.service';
import { tripService, type AdminTripItem } from '../../services/trip.service';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDateTime } from '../../utils';


export const AdminBookingsPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'lookup' | 'trip_manifest'>('lookup');

  // Search by Booking Code
  const [bookingCodeInput, setBookingCodeInput] = useState('');
  const [lookupResult, setLookupResult] = useState<BookingLookupResponse | null>(null);
  const [isSearchingCode, setIsSearchingCode] = useState(false);

  // Quick Check-in by Ticket Code
  const [ticketCodeInput, setTicketCodeInput] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Trip Manifest View
  const [trips, setTrips] = useState<AdminTripItem[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [tripTickets, setTripTickets] = useState<StaffTicketItem[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function loadTrips() {
      try {
        const res = await tripService.getAdminTrips({ limit: 50 });
        if (!ignore && res.data && res.data.length > 0) {
          setTrips(res.data);
          setSelectedTripId(res.data[0].trip_id);
        }
      } catch (err: unknown) {
        console.error('Không thể tải danh sách chuyến:', err);
      }
    }
    loadTrips();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'trip_manifest' || !selectedTripId) return;
    let ignore = false;

    async function fetchTickets() {
      setLoadingTickets(true);
      try {
        const tickets = await bookingService.getTripTickets(selectedTripId);
        if (!ignore) {
          setTripTickets(tickets || []);
        }
      } catch (err: unknown) {
        if (!ignore) {
          toastError(err instanceof Error ? err.message : 'Không thể tải danh sách vé của chuyến');
          setTripTickets([]);
        }
      } finally {
        if (!ignore) {
          setLoadingTickets(false);
        }
      }
    }

    fetchTickets();
    return () => {
      ignore = true;
    };
  }, [activeTab, selectedTripId, reloadKey, toastError]);


  const handleLookupBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCodeInput.trim()) return;

    setIsSearchingCode(true);
    try {
      const res = await bookingService.getBookingByCode(bookingCodeInput.trim());
      setLookupResult(res);
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Không tìm thấy thông tin đơn đặt vé');
      setLookupResult(null);
    } finally {
      setIsSearchingCode(false);
    }
  };

  const handleCheckIn = async (ticketCode: string) => {
    if (!ticketCode.trim()) return;
    setIsCheckingIn(true);
    try {
      const res = await bookingService.checkInTicket(ticketCode.trim());
      success(`Check-in thành công: Hành khách ${res.passenger_name} (Ghế ${res.ticket_code})`);

      // Refresh data
      if (lookupResult) {
        handleLookupBooking({ preventDefault: () => {} } as React.FormEvent);
      }
      if (activeTab === 'trip_manifest' && selectedTripId) {
        setReloadKey((prev) => prev + 1);
      }
      setTicketCodeInput('');

    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Check-in vé thất bại');
    } finally {
      setIsCheckingIn(false);
    }
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
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-[#1E3A5F]" />
            Quản lý Đặt vé & Check-in
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tra cứu đơn đặt vé, danh sách hành khách theo chuyến và xác nhận check-in lên xe
          </p>
        </div>
      </div>

      {/* Quick Check-in Bar */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2B4C7E] p-4 sm:p-5 rounded-2xl text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base">Check-in Nhanh bằng Mã Vé</h3>
            <p className="text-xs text-slate-300">Nhập mã vé hoặc mã QR của hành khách để xác nhận lên xe</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCheckIn(ticketCodeInput);
          }}
          className="flex items-center gap-2 w-full md:w-auto"
        >
          <input
            type="text"
            placeholder="Nhập mã vé (VD: TC-xxxx)..."
            value={ticketCodeInput}
            onChange={(e) => setTicketCodeInput(e.target.value)}
            className="px-3.5 py-2 bg-white text-slate-900 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-full md:w-60"
            required
          />
          <Button
            variant="action"
            size="sm"
            type="submit"
            isLoading={isCheckingIn}
            icon={<CheckCircle className="w-4 h-4" />}
          >
            Check-in
          </Button>
        </form>
      </div>


      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('lookup')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
            activeTab === 'lookup'
              ? 'border-[#1E3A5F] text-[#1E3A5F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Tra cứu Đơn đặt vé</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trip_manifest')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
            activeTab === 'trip_manifest'
              ? 'border-[#1E3A5F] text-[#1E3A5F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Danh sách Vé theo Chuyến xe</span>
        </button>
      </div>

      {/* TAB 1: TRA CỨU ĐƠN ĐẶT VÉ */}
      {activeTab === 'lookup' && (
        <div className="space-y-6">
          <form
            onSubmit={handleLookupBooking}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Nhập mã đặt vé (Booking Code, VD: BK-20261019-XXXX)..."
                value={bookingCodeInput}
                onChange={(e) => setBookingCodeInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:bg-white transition-all font-mono"
                required
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSearchingCode}
            >
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
                              onClick={() => handleCheckIn(t.ticket_code)}
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
      )}

      {/* TAB 2: DANH SÁCH VÉ THEO CHUYẾN XE */}
      {activeTab === 'trip_manifest' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn Chuyến xe cần quản lý
              </label>
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full sm:w-80 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              >
                {trips.map((tr) => (
                  <option key={tr.trip_id} value={tr.trip_id}>
                    {tr.trip_id} ({formatDateTime(tr.departure_time)}) - {tr.status}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setReloadKey((prev) => prev + 1)}
              icon={<RefreshCw className={`w-4 h-4 ${loadingTickets ? 'animate-spin' : ''}`} />}
              className="self-end sm:self-center"
            >
              Tải lại vé
            </Button>

          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {loadingTickets ? (
              <div className="py-16 text-center text-slate-400">
                <div className="w-8 h-8 rounded-full border-2 border-[#1E3A5F] border-t-transparent animate-spin mx-auto mb-2" />
                <span className="text-xs sm:text-sm">Đang tải danh sách hành khách của chuyến...</span>
              </div>
            ) : tripTickets.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Ticket className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-60" />
                <p className="text-sm font-medium">Chuyến xe này chưa có vé nào được đặt</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Mã vé</th>
                      <th className="py-3 px-4">Hành khách</th>
                      <th className="py-3 px-4">Số điện thoại</th>
                      <th className="py-3 px-4">Số ghế</th>
                      <th className="py-3 px-4">Giá vé</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tripTickets.map((tk) => (
                      <tr key={tk.ticket_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">
                          {tk.ticket_code}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">{tk.passenger_name}</td>
                        <td className="py-3 px-4 text-slate-600">{tk.passenger_phone}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold text-xs">
                            Ghế {tk.seat_number}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#C2410C]">
                          {formatCurrency(tk.price)}
                        </td>
                        <td className="py-3 px-4">{getTicketStatusBadge(tk.status)}</td>
                        <td className="py-3 px-4 text-right">
                          {tk.status === 'ISSUED' && (
                            <Button
                              variant="action"
                              size="sm"
                              onClick={() => handleCheckIn(tk.ticket_code)}
                              icon={<CheckCircle className="w-3.5 h-3.5" />}
                            >
                              Check-in
                            </Button>
                          )}

                          {tk.status === 'CHECKED_IN' && (
                            <span className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Đã lên xe
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
