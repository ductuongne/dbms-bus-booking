import React, { useState, useMemo } from 'react';
import {
  Bus,
  ArrowLeftRight,
  Calendar,
  Search,
  Star,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  Sun,
  Sunset,
  Moon,
  SlidersHorizontal,
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { TripCardView } from '../types';
import { mockTripCardViews, mockProvinces } from '../mocks/mockData';
import { SeatSelectionModal } from '../components/SeatSelectionModal';

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const origin = searchParams.get('from') || 'Hà Nội';
  const destination = searchParams.get('to') || 'Ninh Bình';
  const date = searchParams.get('date') || '2026-10-18';

  // Filters state
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedBusTypes, setSelectedBusTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'EARLIEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING'>('EARLIEST');

  // Accordion toggle states
  const [openTimeFilter, setOpenTimeFilter] = useState(true);
  const [openTypeFilter, setOpenTypeFilter] = useState(true);

  // Active seat selection trip
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

  const handleUpdateSearch = () => {
    setSearchParams({ from: origin, to: destination, date });
  };

  const handleToggleTimeSlot = (slot: string) => {
    if (selectedTimeSlots.includes(slot)) {
      setSelectedTimeSlots(selectedTimeSlots.filter((s) => s !== slot));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, slot]);
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Filter logic
  const filteredTrips = useMemo(() => {
    let list = [...mockTripCardViews];

    // Filter by tags (e.g. Đón tận nhà, Trả tận nhà)
    if (selectedTags.length > 0) {
      list = list.filter((trip) =>
        selectedTags.some((tag) => trip.tags.some((t) => t.includes(tag)))
      );
    }

    // Filter by time slots
    if (selectedTimeSlots.length > 0) {
      list = list.filter((trip) => {
        const hour = parseInt(trip.departureTime.split(':')[0], 10);
        return selectedTimeSlots.some((slot) => {
          if (slot === '06-12') return hour >= 6 && hour < 12;
          if (slot === '12-18') return hour >= 12 && hour < 18;
          if (slot === '18-24') return hour >= 18 && hour <= 24;
          if (slot === '00-06') return hour >= 0 && hour < 6;
          return true;
        });
      });
    }

    // Filter by bus type
    if (selectedBusTypes.length > 0) {
      list = list.filter((trip) =>
        selectedBusTypes.includes(trip.busType.name)
      );
    }

    // Sorting
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
  }, [selectedTags, selectedTimeSlots, selectedBusTypes, sortBy]);

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-16">
      {/* 1. Top Search Summary Bar (image_af2fa7.jpg) */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Origin & Destination Bar */}
            <div className="flex items-center gap-2 flex-1 w-full bg-gray-50 p-2 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-2 flex-1 px-2">
                <Bus className="w-4 h-4 text-gray-400" />
                <div className="min-w-0">
                  <span className="block text-[10px] text-gray-400 font-semibold uppercase">Từ</span>
                  <select
                    value={origin}
                    onChange={(e) => handleOriginChange(e.target.value)}
                    className="bg-transparent font-bold text-gray-900 text-xs sm:text-sm focus:outline-none cursor-pointer"
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
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#FF385C] shadow-xs cursor-pointer shrink-0"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2 flex-1 px-2">
                <Bus className="w-4 h-4 text-gray-400" />
                <div className="min-w-0">
                  <span className="block text-[10px] text-gray-400 font-semibold uppercase">Đến</span>
                  <select
                    value={destination}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    className="bg-transparent font-bold text-gray-900 text-xs sm:text-sm focus:outline-none cursor-pointer"
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

            {/* Date bar */}
            <div className="flex items-center gap-2 w-full md:w-auto bg-gray-50 p-2 rounded-2xl border border-gray-200">
              <Calendar className="w-4 h-4 text-gray-400 ml-2" />
              <div>
                <span className="block text-[10px] text-gray-400 font-semibold uppercase">Ngày khởi hành</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="bg-transparent font-bold text-gray-900 text-xs sm:text-sm focus:outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => handleDateChange('2026-10-18')}
                  className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-rose-50 hover:text-[#FF385C] border border-gray-200 rounded-lg cursor-pointer"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => handleDateChange('2026-10-19')}
                  className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-rose-50 hover:text-[#FF385C] border border-gray-200 rounded-lg cursor-pointer"
                >
                  Ngày mai
                </button>
              </div>
            </div>

            {/* Search red button */}
            <button
              type="button"
              onClick={handleUpdateSearch}
              className="w-10 h-10 rounded-full bg-[#FF385C] hover:bg-[#E00B41] text-white flex items-center justify-center shadow-md shadow-rose-500/20 cursor-pointer shrink-0 transition-transform hover:scale-105"
              aria-label="Cập nhật tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Main Content Split (Sidebar Filters + Trip Listing) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar Filter (image_af2fa7.jpg) */}
          <aside aria-label="Bộ lọc tìm kiếm" className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs sticky top-36 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#FF385C]" />
                  <span>Lọc</span>
                </h3>
                {(selectedTags.length > 0 || selectedTimeSlots.length > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTags([]);
                      setSelectedTimeSlots([]);
                      setSelectedBusTypes([]);
                    }}
                    className="text-[11px] text-[#FF385C] hover:underline font-semibold cursor-pointer"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* Quick Filter Badges (image_af2fa7.jpg) */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'Đón tận nhà', label: 'Đón tận nhà (11)' },
                  { key: 'Trả tận nhà', label: 'Trả tận nhà (14)' },
                  { key: 'Nhà xe', label: 'Nhà xe' },
                  { key: 'Điểm lên', label: 'Điểm lên' },
                  { key: 'Điểm xuống', label: 'Điểm xuống' },
                  { key: 'Loại xe', label: 'Loại xe' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleToggleTag(item.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      selectedTags.includes(item.key)
                        ? 'bg-rose-50 text-[#FF385C] border-[#FF385C]'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Time Slots Filters (image_af2fa7.jpg) */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setOpenTimeFilter(!openTimeFilter)}
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 cursor-pointer"
                >
                  <span>Khung giờ khởi hành</span>
                  {openTimeFilter ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {openTimeFilter && (
                  <div className="space-y-2 text-xs">
                    {[
                      { id: '06-12', label: '06:00 - 12:00 (6)', icon: Sun },
                      { id: '12-18', label: '12:00 - 18:00 (14)', icon: Sun },
                      { id: '18-24', label: '18:00 - 24:00 (30)', icon: Sunset },
                      { id: '00-06', label: '00:00 - 06:00 (2)', icon: Moon },
                    ].map((slot) => {
                      const Icon = slot.icon;
                      const isChecked = selectedTimeSlots.includes(slot.id);
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => handleToggleTimeSlot(slot.id)}
                          className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                            isChecked
                              ? 'border-[#FF385C] bg-rose-50/50 text-[#FF385C] font-semibold'
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-gray-400" />
                            <span>{slot.label}</span>
                          </div>
                          {isChecked && <Check className="w-3.5 h-3.5 text-[#FF385C]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Accordion: Loại xe */}
              <div className="border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenTypeFilter(!openTypeFilter)}
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 cursor-pointer"
                >
                  <span>Loại xe</span>
                  {openTypeFilter ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {openTypeFilter && (
                  <div className="space-y-1.5 text-xs text-gray-600">
                    {['Limousine', 'Xe Giường Nằm 34', 'Xe Limousine 22'].map((typeName) => (
                      <label key={typeName} className="flex items-center gap-2 py-1 cursor-pointer hover:text-gray-900">
                        <input
                          type="checkbox"
                          checked={selectedBusTypes.includes(typeName)}
                          onChange={() => {
                            if (selectedBusTypes.includes(typeName)) {
                              setSelectedBusTypes(selectedBusTypes.filter((t) => t !== typeName));
                            } else {
                              setSelectedBusTypes([...selectedBusTypes, typeName]);
                            }
                          }}
                          className="rounded text-[#FF385C] focus:ring-[#FF385C]"
                        />
                        <span>{typeName}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Right Bus Cards List (image_af2fa7.jpg) */}
          <main className="lg:col-span-9 space-y-4">
            {/* Top Sort / Result Count Header */}
            <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-sm font-bold text-gray-900">
                  {filteredTrips.length} chuyến xe
                </span>
                <span className="text-xs text-gray-500 ml-1.5">phù hợp tuyến {origin} → {destination}</span>
              </div>

              {/* Sort pills */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-gray-400 text-[11px] mr-1 hidden sm:inline">Sắp xếp:</span>
                <button
                  type="button"
                  onClick={() => setSortBy('EARLIEST')}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                    sortBy === 'EARLIEST' ? 'bg-[#FF385C] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Giờ đi sớm nhất
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('PRICE_ASC')}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                    sortBy === 'PRICE_ASC' ? 'bg-[#FF385C] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Giá thấp nhất
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('RATING')}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                    sortBy === 'RATING' ? 'bg-[#FF385C] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Đánh giá cao
                </button>
              </div>
            </div>

            {/* List of Trip Cards */}
            <div className="space-y-4">
              {filteredTrips.map((trip: TripCardView) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
                >
                  {/* Top Bar: Operator Name & Rating */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">
                          {trip.operator.name},{' '}
                          <span className="font-normal text-gray-600 text-sm">{trip.busType.name}</span>
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {trip.availableSeatsCount} trên {trip.totalSeats} ghế còn trống
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-xs shadow-xs">
                        <Star className="w-3.5 h-3.5 fill-white" />
                        {trip.operator.rating}
                      </span>
                    </div>
                  </div>

                  {/* Middle Bar: Schedule & Duration Timeline */}
                  <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Time & Route (Col 8) */}
                    <div className="md:col-span-8 flex items-center justify-between gap-3">
                      {/* Departure */}
                      <div className="text-left min-w-[100px]">
                        <span className="text-xl font-black text-gray-900">{trip.departureTime}</span>
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[130px]" title={trip.departureStation.name}>
                          {trip.departureStation.name}
                        </p>
                      </div>

                      {/* Timeline duration graphic */}
                      <div className="flex-1 flex flex-col items-center px-2">
                        <span className="text-[11px] font-semibold text-gray-400 mb-1">{trip.durationFormatted}</span>
                        <div className="w-full flex items-center">
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                          <div className="flex-1 h-[2px] bg-gray-200 relative">
                            <Bus className="w-3.5 h-3.5 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white" />
                          </div>
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                      </div>

                      {/* Arrival */}
                      <div className="text-right min-w-[100px]">
                        <span className="text-xl font-black text-gray-900">{trip.arrivalTime}</span>
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[130px]" title={trip.arrivalStation.name}>
                          {trip.arrivalStation.name}
                        </p>
                      </div>
                    </div>

                    {/* Price & Action (Col 4) */}
                    <div className="md:col-span-4 flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-5">
                      <div className="text-left md:text-right">
                        <span className="text-2xl font-black text-gray-900">
                          {trip.price.toLocaleString('vi-VN')}đ
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTripForSeats(trip)}
                        className="px-6 py-2.5 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-rose-500/20 transition-all cursor-pointer hover:scale-102 mt-0 md:mt-2"
                      >
                        Xem chỗ ngồi
                      </button>
                    </div>
                  </div>

                  {/* Vehicle Photos Thumbnail Strip (image_af2fa7.jpg: +5 more) */}
                  <div className="flex items-center gap-2 pt-2">
                    {trip.images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-12 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={img}
                          alt={`${trip.operator.name} preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === trip.images.length - 1 && (
                          <div className="absolute inset-0 bg-black/50 text-white font-bold text-[10px] flex items-center justify-center">
                            +5 more
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Badges / Policy Footer (image_af2fa7.jpg: Xác nhận tức thì, Có thể hủy) */}
                  <div className="pt-3 mt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                    {trip.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Interactive Seat Selection Modal when user clicks "Xem chỗ ngồi" */}
      {activeTripForSeats && (
        <SeatSelectionModal
          trip={activeTripForSeats}
          onClose={() => setActiveTripForSeats(null)}
          onProceedToCheckout={(checkoutData) => {
            setActiveTripForSeats(null);
            navigate('/payment', { state: { checkoutData } });
          }}
        />
      )}

      {/* Floating AI Assistant button ("Hỏi RAY" from screenshot image_af2fa7.jpg) */}
      <aside
        aria-label="Trợ lý ảo đặt vé"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 to-[#FF385C] text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-500/30 cursor-pointer hover:scale-105 transition-transform"
      >
        <Sparkles className="w-4 h-4" />
        <span>Hỏi RAY</span>
      </aside>
    </div>
  );
};

export default SearchResultsPage;
