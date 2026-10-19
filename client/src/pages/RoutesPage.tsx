import React, { useEffect, useState, useMemo } from 'react';
import {
  MapPin,
  Clock,
  Navigation,
  Search,
  Info,
  Bus as BusIcon,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { routeService, type RouteListItem } from '../services/route.service';
import { stationService } from '../services/station.service';
import type { RouteDetailView, Province } from '../types';

export const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<RouteListItem[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedFromProvince, setSelectedFromProvince] = useState('');
  const [selectedToProvince, setSelectedToProvince] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Selected route for detail modal
  const [activeRouteDetail, setActiveRouteDetail] = useState<RouteDetailView | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [routesData, provincesData] = await Promise.all([
          routeService.getAllRoutes(),
          stationService.getAllProvinces(),
        ]);
        setRoutes(routesData);
        setProvinces(provincesData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu tuyến đường');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleViewDetail = async (routeId: string) => {
    try {
      const detail = await routeService.getRouteById(routeId);
      setActiveRouteDetail(detail);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể xem chi tiết tuyến đường');
    }
  };

  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      const matchFrom = !selectedFromProvince || r.departureProvinceId === selectedFromProvince;
      const matchTo = !selectedToProvince || r.arrivalProvinceId === selectedToProvince;
      const query = searchKeyword.toLowerCase().trim();
      const matchQuery =
        !query ||
        r.departureStationName.toLowerCase().includes(query) ||
        r.arrivalStationName.toLowerCase().includes(query) ||
        r.departureProvince.toLowerCase().includes(query) ||
        r.arrivalProvince.toLowerCase().includes(query);
      return matchFrom && matchTo && matchQuery;
    });
  }, [routes, selectedFromProvince, selectedToProvince, searchKeyword]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} phút`;
    if (mins === 0) return `${hours} giờ`;
    return `${hours} giờ ${mins} phút`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E1B4B] text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30">
            <Sparkles className="w-3.5 h-3.5 text-[#FF385C]" />
            <span>Thông tin tuyến đường &amp; Lộ trình thực tế</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Mạng Lưới Tuyến Xe Toàn Quốc
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Tra cứu thông tin chính xác về các tuyến xe khách liên tỉnh, khoảng cách thực tế, thời gian di chuyển dự kiến và danh sách các điểm đón trả trung gian.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 flex flex-col md:flex-row gap-3 items-center">
          {/* Keyword Search */}
          <div className="flex-1 w-full flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo bến xe hoặc tỉnh thành..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-900 focus:outline-none placeholder:text-gray-400"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Filter From Province */}
          <div className="w-full md:w-56 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-[10px] font-semibold text-gray-400 uppercase">Tỉnh đi</label>
            <select
              value={selectedFromProvince}
              onChange={(e) => setSelectedFromProvince(e.target.value)}
              className="w-full bg-transparent font-medium text-xs sm:text-sm text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="">Tất cả tỉnh đi</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter To Province */}
          <div className="w-full md:w-56 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-[10px] font-semibold text-gray-400 uppercase">Tỉnh đến</label>
            <select
              value={selectedToProvince}
              onChange={(e) => setSelectedToProvince(e.target.value)}
              className="w-full bg-transparent font-medium text-xs sm:text-sm text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="">Tất cả tỉnh đến</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {(selectedFromProvince || selectedToProvince || searchKeyword) && (
            <button
              type="button"
              onClick={() => {
                setSelectedFromProvince('');
                setSelectedToProvince('');
                setSearchKeyword('');
              }}
              className="px-3 py-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-medium cursor-pointer shrink-0"
            >
              Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* Main Route Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#FF385C]" />
            <span>Danh sách tuyến xe đang vận hành ({filteredRoutes.length})</span>
          </h2>
          <span className="text-xs text-gray-500">Dữ liệu thời gian thực từ SQL Server</span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#FF385C] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Đang tải danh sách tuyến đường...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-center space-y-2">
            <p className="font-semibold text-sm">Có lỗi khi kết nối cơ sở dữ liệu:</p>
            <p className="text-xs text-rose-600">{error}</p>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-3">
            <Navigation className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-700 text-base">Không tìm thấy tuyến đường phù hợp</h3>
            <p className="text-xs text-gray-400">Hãy thử thay đổi điều kiện tìm kiếm hoặc bộ lọc tỉnh thành</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top route badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600">
                      {route.id}
                    </span>
                    <span className="text-xs font-semibold text-[#FF385C] bg-rose-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(route.estimatedDuration)}
                    </span>
                  </div>

                  {/* Route trajectory */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0 ring-4 ring-emerald-100" />
                      <div>
                        <span className="block text-[11px] uppercase font-bold text-gray-400">
                          {route.departureProvince}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {route.departureStationName}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-1.5 text-xs text-gray-400">
                      <div className="w-0.5 h-6 bg-gray-200" />
                      <span className="text-[11px] font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                        {route.distanceKm} km
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full bg-rose-500 mt-1 shrink-0 ring-4 ring-rose-100" />
                      <div>
                        <span className="block text-[11px] uppercase font-bold text-gray-400">
                          {route.arrivalProvince}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {route.arrivalStationName}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom action */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <BusIcon className="w-4 h-4 text-gray-400" />
                    <span>Xe Limousine / Giường nằm</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewDetail(route.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF385C] hover:text-[#E00B41] cursor-pointer group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Lộ trình chi tiết</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Route Detail Modal with Visual Timeline */}
      {activeRouteDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] text-rose-300 font-mono font-semibold uppercase tracking-wider">
                  Mã tuyến: {activeRouteDetail.id}
                </span>
                <h3 className="text-lg font-bold">
                  {activeRouteDetail.departureProvince} → {activeRouteDetail.arrivalProvince}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveRouteDetail(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Quick stats banner */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <span className="block text-[11px] text-gray-400 font-semibold uppercase">Tổng cự ly</span>
                  <span className="text-base font-black text-gray-900">{activeRouteDetail.distanceKm} km</span>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <span className="block text-[11px] text-gray-400 font-semibold uppercase">Thời gian ước tính</span>
                  <span className="text-base font-black text-[#FF385C]">
                    {formatDuration(activeRouteDetail.estimatedDuration)}
                  </span>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 col-span-2 sm:col-span-1">
                  <span className="block text-[11px] text-gray-400 font-semibold uppercase">Điểm dừng</span>
                  <span className="text-base font-black text-emerald-600">
                    {activeRouteDetail.stops.length > 0 ? `${activeRouteDetail.stops.length} điểm` : 'Đi thẳng'}
                  </span>
                </div>
              </div>

              {/* Requirement 12: Route Visual Stop Sequence */}
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF385C]" />
                  <span>Sơ đồ lộ trình &amp; Thứ tự trạm dừng (SQL Server)</span>
                </h4>

                <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200/80">
                  {activeRouteDetail.stops.length > 0 ? (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-gray-300 before:to-rose-500">
                      {activeRouteDetail.stops.map((stop, index) => {
                        const isFirst = index === 0;
                        const isLast = index === activeRouteDetail.stops.length - 1;
                        return (
                          <div key={stop.id} className="relative flex items-start gap-3">
                            {/* Circle badge on timeline */}
                            <div
                              className={`absolute -left-[19px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                                isFirst
                                  ? 'bg-emerald-500 ring-4 ring-emerald-100'
                                  : isLast
                                  ? 'bg-rose-500 ring-4 ring-rose-100'
                                  : 'bg-amber-500 ring-4 ring-amber-100'
                              }`}
                            />
                            <div className="flex-1 bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isFirst
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : isLast
                                      ? 'bg-rose-50 text-rose-700'
                                      : 'bg-amber-50 text-amber-700'
                                  }`}
                                >
                                  {isFirst
                                    ? `Bến xuất phát (Thứ tự #${stop.stopOrder})`
                                    : isLast
                                    ? `Bến đích (Thứ tự #${stop.stopOrder})`
                                    : `Trạm dừng trung gian #${stop.stopOrder}`}
                                </span>
                                <span className="text-xs font-semibold text-gray-500">
                                  {stop.provinceName}
                                </span>
                              </div>
                              <h5 className="font-bold text-gray-900 text-sm">{stop.stationName}</h5>
                              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                <span>{stop.address}</span>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Default departure and arrival visualization if no intermediate stops recorded */
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-gray-100">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">Điểm khởi hành</span>
                          <h5 className="font-bold text-gray-900 text-sm">
                            {activeRouteDetail.departureStationName} ({activeRouteDetail.departureProvince})
                          </h5>
                        </div>
                      </div>

                      <div className="pl-6 text-xs text-gray-400 flex items-center gap-2">
                        <div className="w-0.5 h-4 bg-gray-200" />
                        <span>Tuyến xe chạy thẳng không dừng ({activeRouteDetail.distanceKm} km)</span>
                      </div>

                      <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-gray-100">
                        <div className="w-3 h-3 rounded-full bg-rose-500 mt-1 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold text-rose-600 uppercase">Điểm đến</span>
                          <h5 className="font-bold text-gray-900 text-sm">
                            {activeRouteDetail.arrivalStationName} ({activeRouteDetail.arrivalProvince})
                          </h5>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notice */}
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Lưu ý: Thời gian di chuyển thực tế có thể thay đổi tùy thuộc vào tình hình giao thông và thời tiết. Hành khách vui lòng có mặt tại bến xe trước giờ xuất bến 30 phút.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActiveRouteDetail(null)}
                className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
