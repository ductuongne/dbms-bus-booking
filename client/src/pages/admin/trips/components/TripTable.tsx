import React from 'react';
import { Calendar, Play, CheckCircle, XCircle, Clock, Bus } from 'lucide-react';
import type { AdminTripItem } from '../../../../services/trip.service';
import type { RouteListItem } from '../../../../services/route.service';
import type { BusListItemView } from '../../../../types';
import { Badge } from '../../../../components/common';
import { formatCurrency, formatDateTime } from '../../../../utils';

export interface TripTableProps {
  trips: AdminTripItem[];
  loading: boolean;
  routeMap: Map<string, RouteListItem>;
  busMap: Map<string, BusListItemView>;
  onChangeStatus: (tripId: string, newStatus: 'DEPARTED' | 'COMPLETED') => void;
  onCancelTrip: (tripId: string) => void;
}

export const TripTable: React.FC<TripTableProps> = ({
  trips,
  loading,
  routeMap,
  busMap,
  onChangeStatus,
  onCancelTrip,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge variant="brand">Sắp chạy</Badge>;
      case 'DEPARTED':
        return <Badge variant="warning">Đang chạy</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">Hoàn thành</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Đã hủy</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (loading && trips.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400 flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-[#1E3A5F] border-t-transparent animate-spin" />
        <span className="text-xs sm:text-sm">Đang tải danh sách chuyến xe từ cơ sở dữ liệu...</span>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400">
        <Calendar className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-60" />
        <p className="text-sm font-medium">Không tìm thấy chuyến xe nào phù hợp</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-700">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Mã chuyến</th>
              <th className="py-3 px-4">Tuyến đường</th>
              <th className="py-3 px-4">Phương tiện</th>
              <th className="py-3 px-4">Khởi hành & Đến</th>
              <th className="py-3 px-4">Giá vé</th>
              <th className="py-3 px-4">Lấp đầy ghế</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trips.map((trip) => {
              const route = routeMap.get(trip.route_id);
              const bus = busMap.get(trip.bus_id);
              const occupancyRate =
                trip.total_seats > 0
                  ? Math.round((trip.booked_seats / trip.total_seats) * 100)
                  : 0;

              return (
                <tr key={trip.trip_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">
                    {trip.trip_id}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {route ? (
                      <div>
                        <span className="font-semibold text-slate-800">
                          {route.departureStationName} → {route.arrivalStationName}
                        </span>
                        <div className="text-xs text-slate-400">
                          {route.distanceKm} km • {Math.round(route.estimatedDuration / 60)} giờ
                        </div>
                      </div>
                    ) : (
                      trip.route_id
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {bus ? (
                      <div className="flex items-center gap-1.5">
                        <Bus className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{bus.licensePlate}</span>
                        <span className="text-xs text-slate-400">({bus.typeName})</span>
                      </div>
                    ) : (
                      trip.bus_id
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <div className="flex items-center gap-1 text-slate-800 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDateTime(trip.departure_time)}</span>
                    </div>
                    <div className="text-slate-400 pl-4.5">
                      Đến: {formatDateTime(trip.arrival_time)}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#C2410C]">
                    {formatCurrency(trip.price)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            occupancyRate > 80
                              ? 'bg-rose-500'
                              : occupancyRate > 40
                              ? 'bg-emerald-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {trip.booked_seats}/{trip.total_seats}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(trip.status)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {trip.status === 'SCHEDULED' && (
                        <>
                          <button
                            type="button"
                            title="Bắt đầu xuất bến"
                            onClick={() => onChangeStatus(trip.trip_id, 'DEPARTED')}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Hủy chuyến"
                            onClick={() => onCancelTrip(trip.trip_id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {trip.status === 'DEPARTED' && (
                        <button
                          type="button"
                          title="Hoàn thành chuyến xe"
                          onClick={() => onChangeStatus(trip.trip_id, 'COMPLETED')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripTable;
