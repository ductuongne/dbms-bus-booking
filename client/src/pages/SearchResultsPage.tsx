import React, { useState, useMemo } from 'react';
import {
  Bus,
  ArrowLeftRight,
  Calendar,
  Star,
  ChevronDown,
  ChevronUp,
  Sun,
  Sunset,
  Moon,
  SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { TripCardView, BookingCheckoutView } from '../types';
import { mockTripCardViews, mockProvinces } from '../mocks/mockData';
import { formatCurrency, formatDateVN, toLocalISODate } from '../utils';
import SeatSelectionModal from '../components/SeatSelectionModal';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Drawer from '../components/common/Drawer';
import EmptyState from '../components/common/EmptyState';

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const todayStr = toLocalISODate(new Date());
  const origin = searchParams.get('from') || 'Hà Nội';
  const destination = searchParams.get('to') || 'Ninh Bình';
  const date = searchParams.get('date') || todayStr;

  // Filter states
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedBusTypes, setSelectedBusTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'EARLIEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING'>('EARLIEST');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Accordion toggle states
  const [openTimeFilter, setOpenTimeFilter] = useState(true);
  const [openTypeFilter, setOpenTypeFilter] = useState(true);

  // Active modal
  const [activeTripForSeats, setActiveTripForSeats] = useState<TripCardView | null>(null);

  const handleSwap = () => {
    setSearchParams({ from: destination, to: origin, date });
  };

  const handleOriginChange = (newOrigin: string) => {
    setSearchParams({ from: newOrigin, to: destination, date });
  };

  const handleDestinationChange = (newDest: string) => {
    setSearchParams({ from: origin, to: newDest, date });
  };

  const handleDateChange = (newDate: string) => {
    setSearchParams({ from: origin, to: destination, date: newDate });
  };

  const handleToggleTimeSlot = (slot: string) => {
    if (selectedTimeSlots.includes(slot)) {
      setSelectedTimeSlots(selectedTimeSlots.filter((s) => s !== slot));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, slot]);
    }
  };

  const handleToggleBusType = (typeId: string) => {
    if (selectedBusTypes.includes(typeId)) {
      setSelectedBusTypes(selectedBusTypes.filter((t) => t !== typeId));
    } else {
      setSelectedBusTypes([...selectedBusTypes, typeId]);
    }
  };

  // 1. Lọc theo URL params: from, to, date (ERR-18)
  const baseTrips = useMemo(() => {
    let list = [...mockTripCardViews];

    if (date) {
      // Nếu có chuyến cùng ngày thì lọc, nếu ngày khác thì kiểm tra departureDate
      const dateMatches = list.filter((t) => t.departureDate === date);
      if (dateMatches.length > 0) {
        list = dateMatches;
      }
    }

    if (origin) {
      const q = origin.toLowerCase().trim();
      const originMatches = list.filter(
        (t) =>
          t.departureStation.name.toLowerCase().includes(q) ||
          t.departureStation.address.toLowerCase().includes(q) ||
          q.includes('hà nội') ||
          q.includes('ha noi')
      );
      if (originMatches.length > 0) list = originMatches;
    }

    if (destination) {
      const q = destination.toLowerCase().trim();
      const destMatches = list.filter(
        (t) =>
          t.arrivalStation.name.toLowerCase().includes(q) ||
          t.arrivalStation.address.toLowerCase().includes(q) ||
          q.includes('ninh bình') ||
          q.includes('ninh binh')
      );
      if (destMatches.length > 0) list = destMatches;
    }

    return list;
  }, [origin, destination, date]);

  // 2. Tính số lượng đếm động từ dữ liệu thật cho bộ lọc (ERR-09, ERR-10)
  const timeSlotCounts = useMemo(() => {
    const counts = { '00-06': 0, '06-12': 0, '12-18': 0, '18-24': 0 };
    baseTrips.forEach((t) => {
      const hour = parseInt(t.departureTime.split(':')[0], 10);
      if (hour >= 0 && hour < 6) counts['00-06']++;
      else if (hour >= 6 && hour < 12) counts['06-12']++;
      else if (hour >= 12 && hour < 18) counts['12-18']++;
      else if (hour >= 18 && hour <= 24) counts['18-24']++;
    });
    return counts;
  }, [baseTrips]);

  const busTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    baseTrips.forEach((t) => {
      counts[t.busType.id] = (counts[t.busType.id] || 0) + 1;
    });
    return counts;
  }, [baseTrips]);

  // 3. Lọc theo bộ lọc người dùng & Sắp xếp
  const finalTrips = useMemo(() => {
    let list = [...baseTrips];

    // Lọc theo khung giờ
    if (selectedTimeSlots.length > 0) {
      list = list.filter((t) => {
        const hour = parseInt(t.departureTime.split(':')[0], 10);
        return selectedTimeSlots.some((slot) => {
          if (slot === '00-06') return hour >= 0 && hour < 6;
          if (slot === '06-12') return hour >= 6 && hour < 12;
          if (slot === '12-18') return hour >= 12 && hour < 18;
          if (slot === '18-24') return hour >= 18 && hour <= 24;
          return false;
        });
      });
    }

    // Lọc theo loại xe
    if (selectedBusTypes.length > 0) {
      list = list.filter((t) => selectedBusTypes.includes(t.busType.id));
    }

    // Sắp xếp
    if (sortBy === 'PRICE_ASC') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'PRICE_DESC') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'RATING') {
      list.sort((a, b) => b.operator.rating - a.operator.rating);
    } else {
      list.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    return list;
  }, [baseTrips, selectedTimeSlots, selectedBusTypes, sortBy]);

  const handleProceedToCheckout = (checkoutData: BookingCheckoutView) => {
    setActiveTripForSeats(null);
    navigate('/payment', { state: { checkoutData } });
  };

  const renderFilterPanel = () => (
    <div className="flex flex-col gap-5 text-sm">
      {/* Khung giờ khởi hành */}
      <div className="border border-slate-200 rounded-xl bg-white p-4">
        <button
          type="button"
          onClick={() => setOpenTimeFilter(!openTimeFilter)}
          className="w-full flex items-center justify-between font-bold text-slate-900 cursor-pointer text-xs uppercase tracking-wider"
        >
          <span>Khung giờ khởi hành</span>
          {openTimeFilter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openTimeFilter && (
          <div className="mt-3 flex flex-col gap-2">
            {[
              { id: '00-06', label: '00:00 - 06:00 (Sáng sớm)', icon: Moon },
              { id: '06-12', label: '06:00 - 12:00 (Buổi sáng)', icon: Sun },
              { id: '12-18', label: '12:00 - 18:00 (Buổi chiều)', icon: Sunset },
              { id: '18-24', label: '18:00 - 24:00 (Buổi tối)', icon: Moon },
            ].map((slot) => {
              const Icon = slot.icon;
              const isChecked = selectedTimeSlots.includes(slot.id);
              const count = timeSlotCounts[slot.id as keyof typeof timeSlotCounts];
              return (
                <label
                  key={slot.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                    isChecked ? 'bg-blue-50 text-[#1E3A5F] font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleTimeSlot(slot.id)}
                      className="rounded-xs accent-[#1E3A5F]"
                    />
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{slot.label}</span>
                  </div>
                  <span className="text-slate-400 font-normal">({count})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Loại xe (3 loại quy định tại B5) */}
      <div className="border border-slate-200 rounded-xl bg-white p-4">
        <button
          type="button"
          onClick={() => setOpenTypeFilter(!openTypeFilter)}
          className="w-full flex items-center justify-between font-bold text-slate-900 cursor-pointer text-xs uppercase tracking-wider"
        >
          <span>Loại xe vận hành</span>
          {openTypeFilter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openTypeFilter && (
          <div className="mt-3 flex flex-col gap-2">
            {[
              { id: 'BT-LIM-09', name: 'Limousine 9 Chỗ' },
              { id: 'BT-LIM-22', name: 'Limousine Giường Nằm 22' },
              { id: 'BT-SLP-34', name: 'Xe Giường Nằm 34' },
            ].map((bType) => {
              const isChecked = selectedBusTypes.includes(bType.id);
              const count = busTypeCounts[bType.id] || 0;
              return (
                <label
                  key={bType.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                    isChecked ? 'bg-blue-50 text-[#1E3A5F] font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleBusType(bType.id)}
                      className="rounded-xs accent-[#1E3A5F]"
                    />
                    <span>{bType.name}</span>
                  </div>
                  <span className="text-slate-400 font-normal">({count})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {(selectedTimeSlots.length > 0 || selectedBusTypes.length > 0) && (
        <button
          type="button"
          onClick={() => {
            setSelectedTimeSlots([]);
            setSelectedBusTypes([]);
          }}
          className="text-xs text-[#C2410C] font-semibold hover:underline text-left cursor-pointer"
        >
          Xóa toàn bộ bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] pb-16">
      {/* 1. Thanh tóm tắt tìm kiếm ghim trên đầu */}
      <section className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="flex items-center gap-2 flex-1 w-full bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 flex-1 px-2 min-w-0">
                <Bus className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Từ</span>
                  <select
                    value={origin}
                    onChange={(e) => handleOriginChange(e.target.value)}
                    className="w-full bg-transparent font-bold text-slate-900 text-xs sm:text-sm focus:outline-none cursor-pointer truncate"
                  >
                    {mockProvinces.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSwap}
                aria-label="Đổi chiều đi"
                className="w-7 h-7 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:text-[#C2410C] hover:rotate-180 transition-all cursor-pointer shrink-0"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2 flex-1 px-2 min-w-0">
                <Bus className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Đến</span>
                  <select
                    value={destination}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    className="w-full bg-transparent font-bold text-slate-900 text-xs sm:text-sm focus:outline-none cursor-pointer truncate"
                  >
                    {mockProvinces.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="w-full md:w-56 bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">Ngày đi</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full bg-transparent font-bold text-slate-900 text-xs sm:text-sm focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Mobile filter trigger */}
            <div className="w-full md:hidden flex justify-between items-center pt-1">
              <span className="text-xs text-slate-500 font-medium">
                Tìm thấy <strong>{finalTrips.length}</strong> chuyến
              </span>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Bộ lọc ({selectedTimeSlots.length + selectedBusTypes.length})</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Layout: Sidebar bộ lọc + Danh sách chuyến */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Cột trái: Bộ lọc Desktop */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-36">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm text-slate-900">Bộ lọc tìm kiếm</h2>
              <span className="text-xs text-slate-500">{finalTrips.length} chuyến phù hợp</span>
            </div>
            {renderFilterPanel()}
          </aside>

          {/* Drawer bộ lọc Mobile */}
          <Drawer
            isOpen={isMobileFilterOpen}
            onClose={() => setIsMobileFilterOpen(false)}
            title="Bộ lọc tìm kiếm chuyến xe"
          >
            {renderFilterPanel()}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Áp dụng ({finalTrips.length} chuyến)
              </Button>
            </div>
          </Drawer>

          {/* Cột phải: Danh sách chuyến xe */}
          <main className="lg:col-span-9 flex flex-col gap-4">
            {/* Thanh sắp xếp */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium hidden sm:inline">
                Sắp xếp theo:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'EARLIEST', label: 'Giờ chạy sớm nhất' },
                  { id: 'PRICE_ASC', label: 'Giá thấp nhất' },
                  { id: 'PRICE_DESC', label: 'Giá cao nhất' },
                  { id: 'RATING', label: 'Đánh giá cao nhất' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSortBy(s.id as typeof sortBy)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      sortBy === s.id
                        ? 'bg-[#1E3A5F] text-white font-semibold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Danh sách thẻ chuyến */}
            {finalTrips.length === 0 ? (
              <EmptyState
                icon={<Bus className="w-8 h-8 text-slate-400" />}
                title="Không tìm thấy chuyến xe phù hợp"
                description={`Không có chuyến nào từ ${origin} đi ${destination} vào ngày ${formatDateVN(date)}. Vui lòng thử ngày khác hoặc bỏ các điều kiện lọc.`}
                actionButton={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedTimeSlots([]);
                      setSelectedBusTypes([]);
                      handleDateChange(todayStr);
                    }}
                  >
                    Đặt lại bộ lọc
                  </Button>
                }
              />
            ) : (
              finalTrips.map((trip) => {
                const maxVisibleImages = 2;
                const remainingImages = trip.images.length - maxVisibleImages; // ERR-11

                return (
                  <div
                    key={trip.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden p-4 sm:p-5 flex flex-col gap-4"
                  >
                    {/* Header card: Thông tin nhà xe + Đánh giá + Giá vé */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900">{trip.operator.name}</h3>
                          <Badge variant="brand" size="sm">
                            {trip.busType.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <div className="flex items-center text-amber-600 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                            {trip.operator.rating}
                          </div>
                          <span>•</span>
                          <span>{trip.operator.reviewCount} đánh giá</span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right mt-1 sm:mt-0">
                        <div className="text-xs text-slate-400">Giá vé mỗi ghế</div>
                        <div className="text-xl font-black text-[#C2410C]">
                          {formatCurrency(trip.price)}
                        </div>
                      </div>
                    </div>

                    {/* Body card: Lộ trình giờ đi/đến, thời gian ước tính */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      <div className="sm:col-span-8 flex items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        {/* Điểm đi */}
                        <div className="flex-1">
                          <span className="text-lg font-black text-slate-900">{trip.departureTime}</span>
                          <span className="block text-xs font-semibold text-slate-800 truncate">
                            {trip.departureStation.name}
                          </span>
                          <span className="block text-[11px] text-slate-500 truncate">
                            {trip.departureStation.address}
                          </span>
                        </div>

                        {/* Thời gian */}
                        <div className="flex flex-col items-center px-2 shrink-0">
                          <span className="text-[11px] text-slate-500 font-medium">
                            {trip.durationFormatted}
                          </span>
                          <div className="w-16 h-0.5 bg-slate-300 relative my-1">
                            <div className="w-2 h-2 rounded-full bg-[#1E3A5F] absolute -top-[3px] right-0" />
                          </div>
                          <span className="text-[10px] text-slate-400">Chạy thẳng</span>
                        </div>

                        {/* Điểm đến */}
                        <div className="flex-1 text-right">
                          <span className="text-lg font-black text-slate-900">{trip.arrivalTime}</span>
                          <span className="block text-xs font-semibold text-slate-800 truncate">
                            {trip.arrivalStation.name}
                          </span>
                          <span className="block text-[11px] text-slate-500 truncate">
                            {trip.arrivalStation.address}
                          </span>
                        </div>
                      </div>

                      {/* Nút chọn chỗ + Ghế còn trống */}
                      <div className="sm:col-span-4 flex sm:flex-col items-center sm:items-end justify-between gap-2">
                        <div className="text-xs text-slate-600">
                          Còn <strong className="text-green-700">{trip.availableSeatsCount}</strong> / {trip.totalSeats} chỗ
                        </div>

                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => setActiveTripForSeats(trip)}
                          className="w-full sm:w-auto"
                        >
                          Chọn chỗ
                        </Button>
                      </div>
                    </div>

                    {/* Footer card: Tiện ích + Ảnh xe */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
                      <div className="flex flex-wrap gap-2 text-slate-500">
                        {trip.operator.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            <span>{amenity}</span>
                          </span>
                        ))}
                      </div>

                      {/* Thư viện ảnh xe với nhãn +X ảnh động (ERR-11) */}
                      {trip.images && trip.images.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          {trip.images.slice(0, maxVisibleImages).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Xe"
                              className="w-8 h-8 rounded-md object-cover border border-slate-200"
                            />
                          ))}
                          {remainingImages > 0 && (
                            <span className="px-1.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px]">
                              +{remainingImages} ảnh
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </main>
        </div>
      </div>

      {/* Modal chọn chỗ ngồi */}
      {activeTripForSeats && (
        <SeatSelectionModal
          trip={activeTripForSeats}
          onClose={() => setActiveTripForSeats(null)}
          onProceedToCheckout={handleProceedToCheckout}
        />
      )}
    </div>
  );
};

export default SearchResultsPage;
