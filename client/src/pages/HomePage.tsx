import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bus,
  ArrowLeftRight,
  Calendar,
  Search,
  Star,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { mockProvinces } from '../mocks/mockData';
import { toLocalISODate, addDays, formatDateVN } from '../utils';
import Button from '../components/common/Button';
import { stationService } from '../services/station.service';
import { routeService, type RouteListItem } from '../services/route.service';
import type { Province } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Khởi tạo ngày theo giờ địa phương (ERR-05)
  const todayStr = toLocalISODate(new Date());
  const [provinces, setProvinces] = useState<Province[]>(mockProvinces);
  const [realRoutes, setRealRoutes] = useState<RouteListItem[]>([]);
  const [origin, setOrigin] = useState('Hà Nội');
  const [destination, setDestination] = useState('Ninh Bình');
  const [travelDate, setTravelDate] = useState(todayStr);
  const dateInputRef = useRef<HTMLInputElement>(null);

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
        setRealRoutes(routeList);
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
    const targetDate = addDays(new Date(), daysToAdd);
    setTravelDate(toLocalISODate(targetDate));
  };

  const handleOpenDatePicker = () => {
    if (dateInputRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          dateInputRef.current.showPicker();
        } catch {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/search?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}&date=${encodeURIComponent(travelDate)}`
    );
  };

  const popularRoutes = [
    { from: 'Hà Nội', to: 'Ninh Bình', price: 150000, duration: '1g 15ph', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&q=80' },
    { from: 'Hà Nội', to: 'Hải Phòng', price: 120000, duration: '1g 30ph', image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&q=80' },
    { from: 'TP. Hồ Chí Minh', to: 'Lâm Đồng', price: 280000, duration: '7g 30ph', image: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=500&q=80' },
    { from: 'Đà Nẵng', to: 'Quảng Ninh', price: 350000, duration: '12g 00ph', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&q=80' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC]">
      {/* Hero Section: Navy phẳng #1E3A5F */}
      <section className="bg-[#1E3A5F] text-white pt-10 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-200 border border-white/10 mb-4">
            <Bus className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>Nền tảng vé xe khách &amp; Limousine trực tuyến XeViet</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Đặt vé xe liên tỉnh <br />
            <span className="text-[#C2410C]">Nhanh chóng, Đúng chỗ, Đúng giờ</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mt-3 max-w-xl mx-auto">
            Hỗ trợ xem trực quan sơ đồ chỗ ngồi chuẩn 3 loại xe: Limousine 9 chỗ, Limousine giường nằm 22 và Giường nằm 34.
          </p>
        </div>
      </section>

      {/* Form tìm kiếm nổi */}
      <section className="relative -mt-14 max-w-5xl mx-auto px-4 sm:px-6 w-full z-20">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-200">
          <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-center gap-3">
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
              {/* Điểm đi */}
              <div className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1E3A5F] shrink-0">
                  <Bus className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor="origin-select" className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Điểm đi
                  </label>
                  <select
                    id="origin-select"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-transparent font-bold text-slate-900 text-sm focus:outline-none cursor-pointer truncate"
                  >
                    {provinces.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nút hoán đổi */}
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Đổi chiều tuyến đường"
                className="absolute sm:left-1/2 top-1/2 -translate-y-1/2 sm:-translate-x-1/2 right-3 sm:right-auto z-10 w-8 h-8 rounded-full bg-white shadow-xs border border-slate-300 flex items-center justify-center text-slate-600 hover:text-[#C2410C] hover:rotate-180 transition-all cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>

              {/* Điểm đến */}
              <div className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors sm:pl-6">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1E3A5F] shrink-0">
                  <Bus className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor="dest-select" className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Điểm đến
                  </label>
                  <select
                    id="dest-select"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-transparent font-bold text-slate-900 text-sm focus:outline-none cursor-pointer truncate"
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

            {/* Ngày khởi hành */}
            <div
              onClick={handleOpenDatePicker}
              className="w-full lg:w-[350px] flex items-center gap-3 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1E3A5F] shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <label htmlFor="travel-date-input" className="block text-[11px] font-semibold text-slate-500 uppercase cursor-pointer">
                  Ngày đi
                </label>
                <input
                  ref={dateInputRef}
                  id="travel-date-input"
                  type="date"
                  value={travelDate}
                  min={todayStr}
                  onChange={(e) => setTravelDate(e.target.value)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDatePicker();
                  }}
                  className="w-full bg-transparent font-bold text-slate-900 text-sm focus:outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => handleQuickDate(0)}
                  className={`px-2 py-1 text-[11px] font-medium border rounded-md transition-colors cursor-pointer ${
                    travelDate === todayStr
                      ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDate(1)}
                  className={`px-2 py-1 text-[11px] font-medium border rounded-md transition-colors cursor-pointer ${
                    travelDate === toLocalISODate(addDays(new Date(), 1))
                      ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  Ngày mai
                </button>
              </div>
            </div>

            {/* Nút tìm kiếm */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full lg:w-auto px-6 py-3 shrink-0"
              icon={<Search className="w-4 h-4" />}
            >
              Tìm chuyến xe
            </Button>
          </form>
        </div>
      </section>

      {/* Tuyến phổ biến (B6.1.A) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Tuyến đường phổ biến</h2>
            <p className="text-xs text-slate-500 mt-1">Các hành trình liên tỉnh được hành khách tin tưởng đặt nhiều nhất</p>
          </div>
          <Link
            to="/routes"
            className="text-xs font-bold text-[#1E3A5F] hover:text-[#C2410C] flex items-center gap-1 transition-colors"
          >
            <span>Xem mạng lưới tuyến xe</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {realRoutes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {realRoutes.slice(0, 4).map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  setOrigin(r.departureProvince);
                  setDestination(r.arrivalProvince);
                  navigate(
                    `/search?from=${encodeURIComponent(r.departureProvince)}&to=${encodeURIComponent(r.arrivalProvince)}&date=${encodeURIComponent(travelDate)}`
                  );
                }}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
                    <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {r.id}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-[#C2410C] font-semibold">
                      <Clock className="w-3 h-3" />
                      {Math.round(r.estimatedDuration / 60)}h
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#C2410C] transition-colors">
                    {r.departureProvince} → {r.arrivalProvince}
                  </h4>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {r.departureStationName}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>{r.distanceKm} km</span>
                  <span className="text-[#1E3A5F] group-hover:text-[#C2410C] text-[11px] flex items-center gap-0.5">
                    Đặt vé ngay <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularRoutes.map((route, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setOrigin(route.from);
                  setDestination(route.to);
                  navigate(
                    `/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&date=${encodeURIComponent(travelDate)}`
                  );
                }}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
              >
                <div className="h-32 w-full overflow-hidden relative">
                  <img
                    src={route.image}
                    alt={`${route.from} - ${route.to}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-900">
                    Từ {new Intl.NumberFormat('vi-VN').format(route.price)} đ
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#C2410C] transition-colors flex items-center justify-between">
                      <span>{route.from} → {route.to}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#C2410C]" />
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Thời gian ước tính: {route.duration}</span>
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#1E3A5F]">
                    <span>Xem các chuyến</span>
                    <span>{formatDateVN(travelDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cam kết dịch vụ (3 cột, B6.1.A) */}
      <section className="bg-slate-100/60 border-t border-slate-200 py-14 mt-auto">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xl font-bold text-slate-900">Tại sao nên đặt vé tại XeViet?</h2>
            <p className="text-xs text-slate-500 mt-1">Trải nghiệm đặt vé trực quan, giữ chỗ chuẩn xác và an tâm trên từng cây số</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E3A5F] flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Xác nhận vé tức thì</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ghế ngồi được giữ trực tiếp trên sơ đồ xe ngay khi hoàn tất chuyển khoản VietQR tự động.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Đánh giá nhà xe minh bạch</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Toàn bộ đánh giá từ hành khách thực tế giúp bạn an tâm lựa chọn xe Limousine và Giường nằm.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Bảo hiểm hành khách trọn vẹn</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  100% vé xuất qua hệ thống XeViet đều đi kèm bảo hiểm bắt buộc theo tiêu chuẩn vận tải đường bộ.
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
