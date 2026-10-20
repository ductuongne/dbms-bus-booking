import React from 'react';
import { Ticket, RefreshCw, CheckCircle } from 'lucide-react';
import type { AdminTripItem } from '../../../../services/trip.service';
import type { StaffTicketItem } from '../../../../services/booking.service';
import { Button, Badge } from '../../../../components/common';
import { formatCurrency, formatDateTime } from '../../../../utils';

export interface TripManifestSectionProps {
  trips: AdminTripItem[];
  selectedTripId: string;
  onSelectedTripIdChange: (tripId: string) => void;
  tripTickets: StaffTicketItem[];
  loadingTickets: boolean;
  onRefreshTickets: () => void;
  onCheckIn: (ticketCode: string) => void;
}

export const TripManifestSection: React.FC<TripManifestSectionProps> = ({
  trips,
  selectedTripId,
  onSelectedTripIdChange,
  tripTickets,
  loadingTickets,
  onRefreshTickets,
  onCheckIn,
}) => {
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
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Chọn Chuyến xe cần quản lý
          </label>
          <select
            value={selectedTripId}
            onChange={(e) => onSelectedTripIdChange(e.target.value)}
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
          onClick={onRefreshTickets}
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
                          onClick={() => onCheckIn(tk.ticket_code)}
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
  );
};

export default TripManifestSection;
