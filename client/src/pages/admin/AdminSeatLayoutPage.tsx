import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Bus, Sparkles } from 'lucide-react';
import { busService } from '../../services/bus.service';
import type { BusListItemView, BusDetailView } from '../../types';
import { SeatLayoutVisualizer } from '../../components/SeatLayoutVisualizer';

export const AdminSeatLayoutPage: React.FC = () => {
  const [buses, setBuses] = useState<BusListItemView[]>([]);
  const [selectedBusId, setSelectedBusId] = useState('');
  const [busDetail, setBusDetail] = useState<BusDetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingBus, setLoadingBus] = useState(false);

  // Seat click inspection state
  const [inspectedSeatNumber, setInspectedSeatNumber] = useState<string | null>(null);

  const loadBusSeats = useCallback(async (busId: string) => {
    try {
      setLoadingBus(true);
      const detail = await busService.getBusById(busId);
      setBusDetail(detail);
      setInspectedSeatNumber(detail.seats[0]?.seatNumber || null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể tải sơ đồ ghế của xe');
    } finally {
      setLoadingBus(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const busesData = await busService.getAllBuses();
        setBuses(busesData);
        if (busesData.length > 0) {
          const firstBusId = busesData[0]?.id ?? '';
          setSelectedBusId(firstBusId);
          loadBusSeats(firstBusId);
        }
      } catch (err: unknown) {
        console.error('Failed to load buses for seat layout view', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [loadBusSeats]);

  const handleSelectBus = (busId: string) => {
    setSelectedBusId(busId);
    loadBusSeats(busId);
  };

  const inspectedSeatObj = busDetail?.seats.find((s) => s.seatNumber === inspectedSeatNumber);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Grid className="w-6 h-6 text-[#1E3A5F]" />
            <span>Trực Quan Hóa Sơ Đồ Ghế (Fleet Seat Layout)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Xem và kiểm tra cấu trúc bố trí chỗ ngồi theo từng tầng được lưu trữ trong CSDL SQL Server
          </p>
        </div>

        {/* Bus Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Bus className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={selectedBusId}
            onChange={(e) => handleSelectBus(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
          >
            {buses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.licensePlate} ({b.typeName} • {b.totalSeats} ghế)
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-3 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500">Đang tải dữ liệu từ SQL Server...</p>
        </div>
      ) : !busDetail ? (
        <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center">
          <p className="text-xs text-gray-500">Chưa chọn xe để hiển thị sơ đồ ghế</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visualizer (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#1E3A5F] uppercase">
                  Mã xe: {busDetail.id}
                </span>
                <h3 className="font-bold text-gray-900 text-lg">
                  {busDetail.licensePlate} — {busDetail.typeName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                  {busDetail.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm dừng'}
                </span>
                <span className="text-xs font-bold bg-blue-50 text-[#1E3A5F] px-3 py-1 rounded-full border border-blue-200">
                  {busDetail.floors} Tầng • {busDetail.totalSeats} Chỗ
                </span>
              </div>
            </div>

            {loadingBus ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-3 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <SeatLayoutVisualizer
                seats={busDetail.seats}
                floors={busDetail.floors}
                interactive={true}
                selectedSeats={inspectedSeatNumber ? [inspectedSeatNumber] : []}
                onSelectSeat={(seatNum) => setInspectedSeatNumber(seatNum)}
              />
            )}
          </div>

          {/* Seat Details Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Clicked Seat Details Card */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1E3A5F]" />
                <span>Chi tiết ghế đang chọn</span>
              </h4>

              {inspectedSeatObj ? (
                <div className="space-y-3 text-xs">
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Số ghế</span>
                      <h5 className="font-mono font-black text-2xl text-[#1E3A5F]">
                        {inspectedSeatObj.seatNumber}
                      </h5>
                    </div>
                    <span className="text-xs font-bold bg-white text-[#1E3A5F] px-3 py-1 rounded-full shadow-2xs">
                      Tầng {inspectedSeatObj.floor}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">
                        Loại ghế
                      </span>
                      <span className="font-bold text-gray-900">
                        {inspectedSeatObj.seatType}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">
                        Mã ghế trong DB
                      </span>
                      <span className="font-mono font-semibold text-gray-700 truncate block">
                        {inspectedSeatObj.id}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Nhấp vào một ghế trên sơ đồ để xem chi tiết</p>
              )}
            </div>

            {/* Quick Fleet Summary */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-3">
              <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400">
                Thống kê cấu hình chỗ ngồi
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Số ghế Tầng 1:</span>
                  <span className="font-bold text-gray-900">
                    {busDetail.seats.filter((s) => s.floor === 1).length} ghế
                  </span>
                </div>

                {busDetail.floors === 2 && (
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600">Số ghế Tầng 2:</span>
                    <span className="font-bold text-gray-900">
                      {busDetail.seats.filter((s) => s.floor === 2).length} ghế
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Giường nằm (SLEEPER):</span>
                  <span className="font-bold text-[#1E3A5F]">
                    {busDetail.seats.filter((s) => s.seatType === 'SLEEPER').length}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Ghế VIP:</span>
                  <span className="font-bold text-amber-600">
                    {busDetail.seats.filter((s) => s.seatType === 'VIP').length}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-gray-600">Ghế Tiêu chuẩn (NORMAL):</span>
                  <span className="font-bold text-gray-900">
                    {busDetail.seats.filter((s) => s.seatType === 'NORMAL').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSeatLayoutPage;

