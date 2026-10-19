import React, { useEffect, useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Bus,
  Search,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  tripService,
  type AdminTripItem,
  type CreateTripPayload,
} from '../../services/trip.service';
import { routeService, type RouteListItem } from '../../services/route.service';
import { busService } from '../../services/bus.service';
import type { BusListItemView } from '../../types';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';

import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDateTime } from '../../utils';

export const AdminTripsPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [trips, setTrips] = useState<AdminTripItem[]>([]);
  const [routes, setRoutes] = useState<RouteListItem[]>([]);
  const [buses, setBuses] = useState<BusListItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [reloadKey, setReloadKey] = useState(0);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formRouteId, setFormRouteId] = useState('');
  const [formBusId, setFormBusId] = useState('');
  const [formDriverId, setFormDriverId] = useState('USR-00000000-0000-0000-0000-000000000003');
  const [formDepartureTime, setFormDepartureTime] = useState('');
  const [formArrivalTime, setFormArrivalTime] = useState('');
  const [formPrice, setFormPrice] = useState<number>(250000);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      setLoading(true);
      try {
        const [tripsRes, routesData, busesData] = await Promise.all([
          tripService.getAdminTrips({
            limit: 100,
            status: statusFilter !== 'ALL' ? statusFilter : undefined,
            date: dateFilter || undefined,
          }),
          routeService.getAllRoutes(),
          busService.getAllBuses(),
        ]);
        if (!ignore) {
          setTrips(tripsRes.data || []);
          setRoutes(routesData || []);
          setBuses(busesData || []);
          if (routesData.length > 0 && !formRouteId) {
            setFormRouteId(routesData[0].id);
          }
          if (busesData.length > 0 && !formBusId) {
            setFormBusId(busesData[0].id);
          }
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách chuyến xe');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, [statusFilter, dateFilter, reloadKey, formRouteId, formBusId]);


  const routeMap = useMemo(() => {
    const map = new Map<string, RouteListItem>();
    routes.forEach((r) => map.set(r.id, r));
    return map;
  }, [routes]);

  const busMap = useMemo(() => {
    const map = new Map<string, BusListItemView>();
    buses.forEach((b) => map.set(b.id, b));
    return map;
  }, [buses]);

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const route = routeMap.get(t.route_id);
      const bus = busMap.get(t.bus_id);
      const q = searchQuery.toLowerCase();
      const matchId = t.trip_id.toLowerCase().includes(q);
      const matchRoute = route
        ? `${route.departureStationName} ${route.arrivalStationName}`.toLowerCase().includes(q)
        : false;
      const matchBus = bus ? bus.licensePlate.toLowerCase().includes(q) : false;
      return matchId || matchRoute || matchBus;
    });
  }, [trips, searchQuery, routeMap, busMap]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRouteId || !formBusId || !formDepartureTime || !formArrivalTime || !formPrice) {
      toastError('Vui lòng điền đầy đủ thông tin chuyến xe!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateTripPayload = {
        route_id: formRouteId,
        bus_id: formBusId,
        driver_id: formDriverId,
        departure_time: new Date(formDepartureTime).toISOString(),
        arrival_time: new Date(formArrivalTime).toISOString(),
        price: Number(formPrice),
      };

      await tripService.createTrip(payload);
      success('Tạo chuyến xe mới thành công!');
      setShowCreateModal(false);
      setReloadKey((prev) => prev + 1);
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Không thể tạo chuyến xe!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeStatus = async (tripId: string, newStatus: 'DEPARTED' | 'COMPLETED') => {
    try {
      await tripService.changeTripStatus(tripId, newStatus);
      success(`Cập nhật trạng thái chuyến sang ${newStatus === 'DEPARTED' ? 'Đang chạy' : 'Hoàn thành'}!`);
      setReloadKey((prev) => prev + 1);
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái chuyến');
    }
  };

  const handleCancelTrip = async (tripId: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy chuyến ${tripId}?`)) return;
    try {
      await tripService.cancelTrip(tripId);
      success('Hủy chuyến xe thành công!');
      setReloadKey((prev) => prev + 1);
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Không thể hủy chuyến xe');
    }
  };


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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#1E3A5F]" />
            Quản lý Chuyến xe
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi, điều phối lịch trình, xe và trạng thái khởi hành thời gian thực
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReloadKey((prev) => prev + 1)}
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Làm mới
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Thêm chuyến xe
          </Button>
        </div>
      </div>


      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã chuyến, tuyến đường, biển số xe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SCHEDULED">Sắp chạy (SCHEDULED)</option>
            <option value="DEPARTED">Đang chạy (DEPARTED)</option>
            <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
            <option value="CANCELLED">Đã hủy (CANCELLED)</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
          />
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading && trips.length === 0 ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#1E3A5F] border-t-transparent animate-spin" />
            <span className="text-xs sm:text-sm">Đang tải danh sách chuyến xe từ cơ sở dữ liệu...</span>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Calendar className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-60" />
            <p className="text-sm font-medium">Không tìm thấy chuyến xe nào phù hợp</p>
          </div>
        ) : (
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
                {filteredTrips.map((trip) => {
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
                                title="Bắt đầu xuất bến (DEPARTED)"
                                onClick={() => handleChangeStatus(trip.trip_id, 'DEPARTED')}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Hủy chuyến"
                                onClick={() => handleCancelTrip(trip.trip_id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {trip.status === 'DEPARTED' && (
                            <button
                              type="button"
                              title="Hoàn thành chuyến (COMPLETED)"
                              onClick={() => handleChangeStatus(trip.trip_id, 'COMPLETED')}
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
        )}
      </div>

      {/* Modal Thêm chuyến xe mới */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Thêm chuyến xe mới"
        size="lg"
      >
        <form onSubmit={handleCreateTrip} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tuyến đường</label>
            <select
              value={formRouteId}
              onChange={(e) => setFormRouteId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              required
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id}: {r.departureStationName} → {r.arrivalStationName} ({r.distanceKm} km)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Xe khách vận hành</label>
              <select
                value={formBusId}
                onChange={(e) => setFormBusId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                required
              >
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.licensePlate} ({b.typeName} - {b.totalSeats} chỗ)
                  </option>
                ))}

              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mã tài xế (User ID)</label>
              <Input
                value={formDriverId}
                onChange={(e) => setFormDriverId(e.target.value)}
                placeholder="VD: USR-00000000-0000-0000-0000-000000000003"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian khởi hành</label>
              <Input
                type="datetime-local"
                value={formDepartureTime}
                onChange={(e) => setFormDepartureTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian đến dự kiến</label>
              <Input
                type="datetime-local"
                value={formArrivalTime}
                onChange={(e) => setFormArrivalTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Giá vé cơ bản (VND)</label>
            <Input
              type="number"
              min="10000"
              step="10000"
              value={formPrice}
              onChange={(e) => setFormPrice(Number(e.target.value))}
              placeholder="VD: 250000"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Tạo chuyến xe
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminTripsPage;
