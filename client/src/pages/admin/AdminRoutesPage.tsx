import React, { useEffect, useState, useMemo } from 'react';
import {
  GitFork,
  Plus,
  Eye,
  Trash2,
  Edit2,
  Clock,
  ArrowRight,
  MapPin,
  Search,
  MoveUp,
  MoveDown,
  X,
} from 'lucide-react';
import {
  routeService,
  type RouteListItem,
  type CreateRoutePayload,
  type UpdateRoutePayload,
} from '../../services/route.service';
import { stationService } from '../../services/station.service';
import type { RouteDetailView, StationDetailView } from '../../types';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

export const AdminRoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<RouteListItem[]>([]);
  const [stations, setStations] = useState<StationDetailView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // View Detail Modal
  const [viewingDetail, setViewingDetail] = useState<RouteDetailView | null>(null);

  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteDetailView | null>(null);
  const [departureStationId, setDepartureStationId] = useState('');
  const [arrivalStationId, setArrivalStationId] = useState('');
  const [distanceKm, setDistanceKm] = useState<number>(300);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(480);
  const [intermediateStops, setIntermediateStops] = useState<{ stationId: string; stopOrder: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const [routesData, stationsData] = await Promise.all([
          routeService.getAllRoutes(),
          stationService.getAllStations(),
        ]);
        if (!ignore) {
          setRoutes(routesData);
          setStations(stationsData);
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách tuyến đường');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const filteredRoutes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return routes;
    return routes.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.departureStationName.toLowerCase().includes(q) ||
        r.arrivalStationName.toLowerCase().includes(q) ||
        r.departureProvince.toLowerCase().includes(q) ||
        r.arrivalProvince.toLowerCase().includes(q)
    );
  }, [routes, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingRoute(null);
    if (stations.length >= 2) {
      setDepartureStationId(stations[0]?.id ?? '');
      setArrivalStationId(stations[1]?.id ?? '');
    } else {
      setDepartureStationId('');
      setArrivalStationId('');
    }
    setDistanceKm(100);
    setEstimatedDuration(120);
    setIntermediateStops([]);
    setShowModal(true);
  };

  const handleOpenEditModal = async (routeId: string) => {
    try {
      const detail = await routeService.getRouteById(routeId);
      setEditingRoute(detail);
      setDepartureStationId(detail.departureStationId);
      setArrivalStationId(detail.arrivalStationId);
      setDistanceKm(detail.distanceKm);
      setEstimatedDuration(detail.estimatedDuration);

      // Intermediate stops are stops between departure (first) and arrival (last)
      const intermediate = detail.stops
        .filter((s) => s.stationId !== detail.departureStationId && s.stationId !== detail.arrivalStationId)
        .map((s, idx) => ({
          stationId: s.stationId,
          stopOrder: idx + 2,
        }));
      setIntermediateStops(intermediate);
      setShowModal(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể tải thông tin chỉnh sửa tuyến');
    }
  };

  const handleViewDetail = async (routeId: string) => {
    try {
      const detail = await routeService.getRouteById(routeId);
      setViewingDetail(detail);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể xem chi tiết tuyến');
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tuyến đường ${routeId}?`)) return;
    try {
      await routeService.deleteRoute(routeId);
      setReloadKey((k) => k + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể xóa tuyến (có thể đã có chuyến xe vận hành)');
    }
  };

  // Intermediate Stop Handlers
  const handleAddIntermediateStop = () => {
    if (stations.length === 0) return;
    const available = stations.find(
      (s) =>
        s.id !== departureStationId &&
        s.id !== arrivalStationId &&
        !intermediateStops.some((item) => item.stationId === s.id)
    );
    const stationIdToAdd = available ? available.id : stations[0]?.id ?? '';
    const newOrder = intermediateStops.length + 2;
    setIntermediateStops([...intermediateStops, { stationId: stationIdToAdd, stopOrder: newOrder }]);
  };

  const handleRemoveIntermediateStop = (index: number) => {
    const updated = intermediateStops
      .filter((_, i) => i !== index)
      .map((item, idx) => ({ ...item, stopOrder: idx + 2 }));
    setIntermediateStops(updated);
  };

  const handleChangeIntermediateStation = (index: number, newStationId: string) => {
    const updated = [...intermediateStops];
    const current = updated[index];
    if (current) {
      current.stationId = newStationId;
      setIntermediateStops(updated);
    }
  };

  const handleMoveStop = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= intermediateStops.length) return;
    const updated = [...intermediateStops];
    const temp = updated[index];
    const target = updated[targetIndex];
    if (temp && target) {
      updated[index] = target;
      updated[targetIndex] = temp;
      setIntermediateStops(updated.map((item, idx) => ({ ...item, stopOrder: idx + 2 })));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departureStationId || !arrivalStationId) {
      alert('Vui lòng chọn bến xuất phát và bến đến');
      return;
    }
    if (departureStationId === arrivalStationId) {
      alert('Bến xuất phát và bến đến không được trùng nhau');
      return;
    }
    if (distanceKm <= 0 || estimatedDuration <= 0) {
      alert('Khoảng cách và thời gian ước tính phải lớn hơn 0');
      return;
    }

    try {
      setIsSubmitting(true);
      // Construct full ordered stops list (Departure = order 1, intermediate = order 2..N, Arrival = order N+1)
      const allOrderedStops = [
        { stationId: departureStationId, stopOrder: 1 },
        ...intermediateStops.map((item, idx) => ({
          stationId: item.stationId,
          stopOrder: idx + 2,
        })),
        { stationId: arrivalStationId, stopOrder: intermediateStops.length + 2 },
      ];

      if (editingRoute) {
        const payload: UpdateRoutePayload = {
          departureStationId,
          arrivalStationId,
          distanceKm: Number(distanceKm),
          estimatedDuration: Number(estimatedDuration),
          intermediateStations: allOrderedStops,
        };
        await routeService.updateRoute(editingRoute.id, payload);
      } else {
        const payload: CreateRoutePayload = {
          departureStationId,
          arrivalStationId,
          distanceKm: Number(distanceKm),
          estimatedDuration: Number(estimatedDuration),
          intermediateStations: allOrderedStops,
        };
        await routeService.createRoute(payload);
      }

      setShowModal(false);
      setReloadKey((k) => k + 1);
      alert('Lưu tuyến đường và danh sách trạm dừng thành công!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi khi lưu tuyến đường');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} phút`;
    if (mins === 0) return `${hours} giờ`;
    return `${hours} giờ ${mins} phút`;
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Tuyến Đường &amp; Lộ Trình</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu hình các tuyến xe liên tỉnh, cự ly km, thời gian di chuyển và thứ tự các trạm dừng
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreateModal}
        >
          Thêm tuyến mới
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <Input
          icon={<Search className="w-4 h-4" />}
          placeholder="Tìm theo mã tuyến, tên bến xe hoặc tỉnh thành..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Routes Grid / Cards (Requirement 10: Show station names instead of raw IDs) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Đang tải danh sách tuyến đường...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-xs">{error}</div>
        ) : filteredRoutes.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <GitFork className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-gray-700">Chưa có tuyến đường nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredRoutes.map((route) => (
              <div
                key={route.id}
                className="p-5 hover:bg-gray-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Route visualization summary */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-gray-100 text-gray-700">
                      {route.id}
                    </span>
                    <span className="text-xs font-semibold text-[#1E3A5F] bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(route.estimatedDuration)}
                    </span>
                    <span className="text-xs font-bold text-gray-500">
                      {route.distanceKm} km
                    </span>
                  </div>

                  {/* Route trajectory with station names */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{route.departureStationName}</span>
                      <span className="text-[10px] font-semibold text-gray-400">
                        ({route.departureProvince})
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block shrink-0" />

                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{route.arrivalStationName}</span>
                      <span className="text-[10px] font-semibold text-gray-400">
                        ({route.arrivalProvince})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end lg:self-center">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => handleViewDetail(route.id)}
                  >
                    Lộ trình &amp; Trạm dừng
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenEditModal(route.id)}
                    title="Chỉnh sửa tuyến"
                    aria-label={`Chỉnh sửa tuyến ${route.id}`}
                  />

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => handleDeleteRoute(route.id)}
                    title="Xóa tuyến"
                    aria-label={`Xóa tuyến ${route.id}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Requirement 12: VIEW ROUTE DETAIL MODAL WITH FULL VISUAL TIMELINE */}
      <Modal
        isOpen={Boolean(viewingDetail)}
        onClose={() => setViewingDetail(null)}
        title={`${viewingDetail?.departureStationName ?? ''} → ${viewingDetail?.arrivalStationName ?? ''}`}
        description={`Mã tuyến: ${viewingDetail?.id ?? ''}`}
        maxWidth="xl"
      >
        {viewingDetail && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-bold uppercase text-[10px] block">Khoảng cách</span>
                <span className="text-base font-black text-gray-900">{viewingDetail.distanceKm} km</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-bold uppercase text-[10px] block">Thời gian dự kiến</span>
                <span className="text-base font-black text-[#1E3A5F]">
                  {formatDuration(viewingDetail.estimatedDuration)}
                </span>
              </div>
            </div>

            {/* Requirement 12 Visual Timeline */}
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1E3A5F]" />
                <span>Trình tự trạm dừng (SQL Server Ordered Stops)</span>
              </h4>

              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
                  {viewingDetail.stops.map((stop, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === viewingDetail.stops.length - 1;
                    return (
                      <div key={stop.id} className="relative flex items-start gap-3">
                        <div
                          className={`absolute -left-[19px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                            isFirst
                              ? 'bg-emerald-500 ring-4 ring-emerald-100'
                              : isLast
                              ? 'bg-rose-500 ring-4 ring-rose-100'
                              : 'bg-[#1E3A5F] ring-4 ring-blue-100'
                          }`}
                        />
                        <div className="flex-1 bg-white p-3 rounded-xl border border-gray-100">
                          <div className="flex items-center justify-between text-xs">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isFirst
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : isLast
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-blue-50 text-[#1E3A5F]'
                              }`}
                            >
                              {isFirst ? 'Xuất phát (#1)' : isLast ? `Điểm đích (#${stop.stopOrder})` : `Trạm trung gian #${stop.stopOrder}`}
                            </span>
                            <span className="font-semibold text-gray-500">{stop.provinceName}</span>
                          </div>
                          <h5 className="font-bold text-gray-900 text-sm mt-1">{stop.stationName}</h5>
                          <p className="text-[11px] text-gray-500 mt-0.5">{stop.address}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setViewingDetail(null)}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE / EDIT ROUTE MODAL WITH INTERMEDIATE STOPS BUILDER */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRoute ? `Chỉnh Sửa Tuyến: ${editingRoute.id}` : 'Thêm Tuyến Đường Mới'}
        description="Lưu tuyến đường và danh sách trạm dừng theo thứ tự vào SQL Server"
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Departure & Arrival Stations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Bến xuất phát *"
              required
              value={departureStationId}
              onChange={(e) => setDepartureStationId(e.target.value)}
              options={stations.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.provinceName})`,
              }))}
            />

            <Select
              label="Bến đến *"
              required
              value={arrivalStationId}
              onChange={(e) => setArrivalStationId(e.target.value)}
              options={stations.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.provinceName})`,
              }))}
            />
          </div>

          {/* Distance and Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Khoảng cách (km) *"
              type="number"
              step="0.1"
              min="1"
              required
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
            />

            <div>
              <Input
                label="Thời gian ước tính (phút) *"
                type="number"
                min="10"
                required
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                helperText={`≈ ${formatDuration(estimatedDuration)}`}
              />
            </div>
          </div>

          {/* Requirement 11: INTERMEDIATE STOPS BUILDER */}
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  Trạm dừng trung gian ({intermediateStops.length})
                </h4>
                <p className="text-[11px] text-gray-500">
                  Thêm các điểm dừng đón/trả khách giữa điểm khởi hành và điểm đến
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleAddIntermediateStop}
              >
                Thêm trạm dừng
              </Button>
            </div>

            {intermediateStops.length === 0 ? (
              <div className="p-4 bg-white rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-400">
                Chưa có trạm trung gian nào. Tuyến sẽ chạy thẳng từ bến xuất phát đến bến đến.
              </div>
            ) : (
              <div className="space-y-2">
                {intermediateStops.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs"
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-[#1E3A5F] font-bold text-xs flex items-center justify-center shrink-0">
                      #{idx + 2}
                    </span>

                    <select
                      value={item.stationId}
                      onChange={(e) => handleChangeIntermediateStation(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      {stations.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.provinceName})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveStop(idx, 'UP')}
                        className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                        title="Di chuyển lên"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === intermediateStops.length - 1}
                        onClick={() => handleMoveStop(idx, 'DOWN')}
                        className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                        title="Di chuyển xuống"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveIntermediateStop(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Xóa trạm dừng này"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Buttons */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Lưu tuyến đường
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminRoutesPage;

