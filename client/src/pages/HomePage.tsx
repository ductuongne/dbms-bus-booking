import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bus,
  ArrowLeftRight,
  Calendar,
  Search,
  Sparkles,
  Star,
  Shield,
  Zap,
  Navigation,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { mockProvinces } from '../mocks/mockData';
import { stationService } from '../services/station.service';
import { routeService, type RouteListItem } from '../services/route.service';
import type { Province } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState<Province[]>(mockProvinces);
  const [popularRoutes, setPopularRoutes] = useState<RouteListItem[]>([]);
  const [origin, setOrigin] = useState('Hà Nội');
  const [destination, setDestination] = useState('Ninh Bình');
  const [travelDate, setTravelDate] = useState('2026-10-18');

  useEffect(() => {
    async function loadRealData() {
      try {
        const [provList, routeList] = await Promise.all([
          stationService.getAllProvinces(),
          routeService.getAllRoutes(),
        ]);
        if (provList.length > 0) {
          setProvinces(provList);
        }
        setPopularRoutes(routeList);
      } catch {
        // Fallback to mockData if server is unavailable
      }
    }
    loadRealData();
  }, []);

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleQuickDate = (daysToAdd: number) => {
    const baseDate = new Date('2026-10-18');
    baseDate.setDate(baseDate.getDate() + daysToAdd);
    const dateStr = baseDate.toISOString().split('T')[0];
    setTravelDate(dateStr);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/search?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}&date=${encodeURIComponent(travelDate)}`
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A0B2E] via-[#2A1B3D] to-[#3B1E4A] text-white pt-10 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF385C]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-rose-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-[#FF385C]" />
              <span>Nền tảng đặt vé xe khách số 1 Việt Nam</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Đặt vé xe online <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-400 to-amber-300">
                Nhanh chóng &amp; Tiện lợi
              </span>
            </h1>
            <p className="text-gray-300 text-sm sm:text-base max-w-xl">
              Hơn 500+ nhà xe Limousine và Giường nằm chất lượng cao. Giữ chỗ tức thì, không lo hết vé, thanh toán tiện lợi qua VietQR.
            </p>
          </div>

          <div className="lg:col-span-5 hidden lg:flex justify-center relative">
            <div className="relative w-80 h-64 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-t from-black/60 to-transparent">
              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"
                alt="Xe Limousine cao cấp"
                className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs space-y-1">
                <span className="inline-block px-2 py-0.5 rounded-full bg-rose-500/80 text-white font-semibold text-[10px]">
                  VIP Limousine 11 Chỗ
                </span>
                <p className="font-semibold text-white">Ghế ngả 180° • Cổng sạc • Đón trả tận nhà</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Rounded Search Form */}
      <section className="relative -mt-16 max-w-6xl mx-auto px-4 sm:px-6 w-full z-30">
        <div className="bg-white rounded-3xl p-3 sm:p-5 shadow-2xl border border-gray-100 backdrop-blur-lg">
          <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-center gap-3">
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
              {/* Origin */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/80 hover:bg-gray-100/80 rounded-2xl border border-gray-200/80 transition-colors">
                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#FF385C] shrink-0">
                  <Bus className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor="origin-select" className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Từ
                  </label>
                  <select
                    id="origin-select"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-transparent font-bold text-gray-900 text-sm focus:outline-none cursor-pointer truncate"
                  >
                    {provinces.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Đổi chiều đi"
                className="absolute sm:left-1/2 top-1/2 -translate-y-1/2 sm:-translate-x-1/2 right-4 sm:right-auto z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#FF385C] hover:rotate-180 transition-all duration-300 cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>

              {/* Destination */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/80 hover:bg-gray-100/80 rounded-2xl border border-gray-200/80 transition-colors sm:pl-7">
                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#FF385C] shrink-0">
                  <Bus className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor="dest-select" className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Đến
                  </label>
                  <select
                    id="dest-select"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-transparent font-bold text-gray-900 text-sm focus:outline-none cursor-pointer truncate"
                  >
                    {provinces.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Travel Date */}
            <div className="w-full lg:w-72 flex items-center gap-3 px-4 py-3 bg-gray-50/80 hover:bg-gray-100/80 rounded-2xl border border-gray-200/80 transition-colors">
              <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#FF385C] shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <label htmlFor="travel-date-input" className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Ngày khởi hành
                </label>
                <input
                  id="travel-date-input"
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-transparent font-bold text-gray-900 text-sm focus:outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleQuickDate(0)}
                  className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-rose-50 hover:text-[#FF385C] border border-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDate(1)}
                  className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-rose-50 hover:text-[#FF385C] border border-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Ngày mai
                </button>
              </div>
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              className="w-full lg:w-auto px-8 py-4 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer shrink-0 text-sm sm:text-base"
            >
              <Search className="w-5 h-5" />
              <span>Tìm kiếm xe</span>
            </button>
          </form>
        </div>
      </section>

      {/* Popular Routes Section (SQL Server) */}
      {popularRoutes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF385C] uppercase tracking-wider mb-1">
                <Navigation className="w-3.5 h-3.5" />
                <span>Mạng lưới vận hành</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900">Tuyến đường phổ biến</h2>
            </div>
            <Link
              to="/routes"
              className="text-xs font-bold text-[#FF385C] hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả ({popularRoutes.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularRoutes.map((r) => (
              <Link
                key={r.id}
                to="/routes"
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md hover:border-rose-100 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-2">
                    <span className="font-mono text-[10px] font-bold bg-gray-50 px-2 py-0.5 rounded">
                      {r.id}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-[#FF385C] font-semibold">
                      <Clock className="w-3 h-3" />
                      {Math.round(r.estimatedDuration / 60)}h
                    </span>
                  </div>

                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#FF385C] transition-colors">
                    {r.departureProvince} → {r.arrivalProvince}
                  </h4>

                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                    {r.departureStationName}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-gray-600">
                  <span>{r.distanceKm} km</span>
                  <span className="text-[#FF385C] text-[11px] flex items-center gap-0.5">
                    Lộ trình <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="bg-gray-50/60 border-y border-gray-100 py-14 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-gray-900">Tại sao nên đặt vé tại redBus?</h2>
            <p className="text-xs text-gray-500 mt-2">Dịch vụ vận chuyển liên tỉnh chất lượng số 1 với trải nghiệm khách hàng tối ưu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#FF385C] flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Xác nhận vé tức thì</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Vé điện tử và số ghế được gửi ngay qua SMS và Email sau khi thanh toán thành công qua mã VietQR.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Đánh giá minh bạch</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  100% đánh giá thật từ khách hàng đã trải nghiệm dịch vụ xe khách, giúp bạn dễ dàng chọn nhà xe ưng ý.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Bảo hiểm trọn chuyến đi</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Mỗi vé xe đều bao gồm bảo hiểm hành khách bắt buộc, cam kết đúng lịch trình và hoàn tiền nếu có sự cố.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
