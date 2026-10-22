import React from 'react';
import { Ticket, RefreshCw, CheckCircle, Calendar, Bus, Users, Clock } from 'lucide-react';
import type { AdminTripItem } from '../../../../services/trip.service';
import type { StaffTicketItem } from '../../../../services/booking.service';
import { Button, Badge } from '../../../../components/common';
import { formatCurrency, formatDateTime } from '../../../../utils';

export interface TripManifestSectionProps {
  trips: AdminTripItem[];
  tripDate: string;
  onTripDateChange: (date: string) => void;
  loadingTrips: boolean;
  selectedTripId: string;
  onSelectedTripIdChange: (tripId: string) => void;
  tripTickets: StaffTicketItem[];
  loadingTickets: boolean;
  onRefreshTickets: () => void;
  onCheckIn: (ticketCode: string) => void;
}

export const TripManifestSection: React.FC<TripManifestSectionProps> = ({
  trips,
  tripDate,
  onTripDateChange,
  loadingTrips,
  selectedTripId,
  onSelectedTripIdChange,
  tripTickets,
  loadingTickets,
  onRefreshTickets,
  onCheckIn,
}) => {
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

  const getTripStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge variant="brand">Sắp khởi hành</Badge>;
      case 'DEPARTED':
        return <Badge variant="warning">Đang chạy</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">Đã hoàn thành</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Đã hủy chuyến</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleSetToday = () => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = today.getFullYear();
    const m = pad(today.getMonth() + 1);
    const d = pad(today.getDate());
    onTripDateChange(`${y}-${m}-${d}`);
  };

  const selectedTrip = trips.find((t) => t.trip_id === selectedTripId);

  return (
    <div className="space-y-4">
      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3">
          {/* Date Filter */}
          <div className="w-full lg:w-72">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#1E3A5F]" />
                <span>Lọc theo ngày khởi hành</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleSetToday}
                  className="text-[11px] font-medium text-[#1E3A5F] hover:underline cursor-pointer"
                >
                  Hôm nay
                </button>
                {tripDate && (
                  <>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => onTripDateChange('')}
                      className="text-[11px] font-medium text-slate-500 hover:text-red-600 cursor-pointer"
                    >
                      Tất cả
                    </button>
                  </>
                )}
              </div>
            </div>
            <input
              type="date"
              value={tripDate}
              onKeyDown={(e) => e.preventDefault()}
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker();
                } catch {
                  // Fallback
                }
              }}
              onChange={(e) => onTripDateChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:bg-white transition-all cursor-pointer select-none"
            />
          </div>

          {/* Trip Selector Dropdown */}
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn Chuyến xe cần quản lý {loadingTrips ? '(Đang tải...)' : `(${trips.length} chuyến)`}
            </label>
            <select
              value={selectedTripId}
              onChange={(e) => onSelectedTripIdChange(e.target.value)}
              disabled={loadingTrips || trips.length === 0}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:bg-white transition-all disabled:opacity-60"
            >
              {trips.length === 0 ? (
                <option value="">
                  {loadingTrips ? 'Đang tải danh sách chuyến xe...' : 'Không có chuyến xe nào phù hợp'}
                </option>
              ) : (
                trips.map((tr) => (
                  <option key={tr.trip_id} value={tr.trip_id}>
                    {tr.trip_id} • {formatDateTime(tr.departure_time)} • Tuyến {tr.route_id} • ({tr.booked_seats}/{tr.total_seats} vé) - {tr.status}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Refresh Action Button */}
          <Button
            variant="outline"
            size="md"
            onClick={onRefreshTickets}
            disabled={!selectedTripId || loadingTickets}
            icon={<RefreshCw className={`w-4 h-4 ${loadingTickets ? 'animate-spin' : ''}`} />}
            className="self-stretch lg:self-end shrink-0"
          >
            Tải lại vé
          </Button>
        </div>
      </div>

      {/* Selected Trip Quick Info Card */}
      {selectedTrip && (
        <div className="bg-gradient-to-r from-slate-900 to-[#1E3A5F] text-white p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Bus className="w-4 h-4 text-sky-400" />
              <span>Chuyến: <strong className="font-mono text-white text-sm">{selectedTrip.trip_id}</strong></span>
              <span className="text-slate-400">({selectedTrip.route_id})</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Khởi hành: <strong className="text-white">{formatDateTime(selectedTrip.departure_time)}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Đã đặt: <strong className="text-white">{selectedTrip.booked_seats} / {selectedTrip.total_seats} ghế</strong></span>
            </div>
          </div>

          <div>
            {getTripStatusBadge(selectedTrip.status)}
          </div>
        </div>
      )}

      {/* Passenger Tickets Manifest Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loadingTickets ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-[#1E3A5F] border-t-transparent animate-spin mx-auto mb-2" />
            <span className="text-xs sm:text-sm">Đang tải danh sách hành khách của chuyến...</span>
          </div>
        ) : !selectedTripId || trips.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Calendar className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-600">
              {tripDate
                ? `Không có chuyến xe nào vào ngày ${tripDate}`
                : 'Vui lòng chọn chuyến xe để xem danh sách vé hành khách'}
            </p>
            {tripDate && (
              <button
                type="button"
                onClick={() => onTripDateChange('')}
                className="mt-2 text-xs font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
              >
                Hiển thị tất cả chuyến xe
              </button>
            )}
          </div>
        ) : tripTickets.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Ticket className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-600">Chuyến xe này chưa có vé nào được đặt</p>
            <p className="text-xs text-slate-400 mt-1">Các vé khi khách thanh toán thành công sẽ xuất hiện tại đây</p>
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
                    <td className="py-3 px-4 text-slate-600 font-mono">{tk.passenger_phone}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold text-xs">
                        Ghế {tk.seat_number}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#C2410C]">
                      {formatCurrency(tk.price)}
                    </td>
                    <td className="py-3 px-4">{getTicketStatusBadge(tk.status)}</td>
                    <td className="py-3 px-4 text-right">
                      {['CONFIRMED', 'ISSUED'].includes(tk.status) && (
                        <Button
                          variant="action"
                          size="sm"
                          onClick={() => onCheckIn(tk.ticket_code)}
                          icon={<CheckCircle className="w-3.5 h-3.5" />}
                        >
                          Check-in
                        </Button>
                      )}

                      {tk.status === 'CHECKED_IN' && (
                        <span className="text-xs text-emerald-600 font-medium inline-flex items-center justify-end gap-1">
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
  );
};

export default TripManifestSection;
