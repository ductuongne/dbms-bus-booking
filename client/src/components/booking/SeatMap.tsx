import React from 'react';
import { Check, X, Clock, Disc } from 'lucide-react';
import type { BusLayoutConfig, SeatCell, SeatZone } from '../../types';

export interface SeatMapProps {
  layout: BusLayoutConfig;
  seats: SeatCell[];
  selectedIds: string[];
  onToggle: (seatId: string) => void;
  maxSelectable?: number;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  layout,
  seats,
  selectedIds,
  onToggle,
}) => {
  const isSleeper = layout.busTypeCode.includes('SLP') || layout.busTypeCode.includes('22');

  const zoneBorderStyles: Record<SeatZone, string> = {
    blue: 'border-blue-500 text-blue-900 hover:bg-blue-50/50',
    purple: 'border-purple-500 text-purple-900 hover:bg-purple-50/50',
    amber: 'border-amber-500 text-amber-900 hover:bg-amber-50/50',
    green: 'border-green-500 text-green-900 hover:bg-green-50/50',
  };

  const zoneNames: Record<SeatZone, string> = {
    blue: 'Vùng tiêu chuẩn',
    purple: 'Vùng đầu xe',
    amber: 'Vùng giữa xe',
    green: 'Vùng cuối xe',
  };

  // Lấy các vùng màu xuất hiện trong xe để làm chú thích
  const presentZones = Array.from(new Set(seats.map((s) => s.zone))) as SeatZone[];

  const renderSeat = (seat: SeatCell) => {
    const isSelected = selectedIds.includes(seat.id);
    const isBooked = seat.status === 'BOOKED';
    const isHeld = seat.status === 'HELD';
    const isAvailable = seat.status === 'AVAILABLE';

    let statusLabel = 'trống';
    if (isSelected) statusLabel = 'đang chọn';
    else if (isBooked) statusLabel = 'đã đặt';
    else if (isHeld) statusLabel = 'đang được giữ';

    return (
      <button
        key={seat.id}
        type="button"
        disabled={!isAvailable && !isSelected}
        onClick={() => onToggle(seat.id)}
        aria-label={`Ghế ${seat.label}, ${statusLabel}`}
        aria-pressed={isSelected}
        aria-disabled={!isAvailable && !isSelected}
        style={{
          gridRow: seat.row,
          gridColumn: seat.col,
        }}
        className={`relative flex flex-col items-center justify-center rounded-lg border text-xs font-semibold select-none transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] ${
          isSleeper ? 'w-10 sm:w-12 h-14' : 'w-10 sm:w-11 h-11'
        } ${
          isSelected
            ? 'bg-[#C2410C] border-[#C2410C] text-white shadow-xs scale-102 z-10'
            : isBooked
            ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
            : isHeld
            ? 'bg-slate-100 border-dashed border-slate-400 text-slate-500 cursor-not-allowed'
            : `bg-white ${zoneBorderStyles[seat.zone]}`
        }`}
      >
        {/* Đồ họa gối cho xe giường nằm */}
        {isSleeper && (
          <div
            className={`w-6 sm:w-7 h-1.5 rounded-xs mb-1 ${
              isSelected
                ? 'bg-white/40'
                : isBooked
                ? 'bg-slate-300'
                : 'bg-slate-200'
            }`}
          />
        )}

        <span className="leading-none text-[11px] sm:text-xs tracking-tight">
          {seat.label}
        </span>

        {/* Biểu tượng trạng thái trực quan kết hợp màu & hình (B5.6) */}
        <div className="mt-0.5">
          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
          {isBooked && <X className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />}
          {isHeld && <Clock className="w-3 h-3 text-slate-500" />}
        </div>
      </button>
    );
  };

  const renderFloorGrid = (floorNumber: 1 | 2) => {
    const floorSeats = seats.filter((s) => s.floor === floorNumber);

    // Tính toán vô lăng tài xế
    const hasDriverAtRow0 = layout.driver && layout.driver.floor === floorNumber && layout.driver.row === 0;
    const hasDriverInsideGrid = layout.driver && layout.driver.floor === floorNumber && layout.driver.row > 0;

    return (
      <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50/80 border border-slate-200">
        {/* Vô lăng ở hàng riêng trên cùng nếu row === 0 (như xe Limousine 22) */}
        {hasDriverAtRow0 && (
          <div className="w-full mb-3 pb-2 border-b border-slate-200 flex justify-start pl-2">
            <div
              title="Vị trí tài xế"
              className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shadow-2xs"
            >
              <Disc className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        )}

        {/* Lưới ghế CSS Grid động theo số cột và số hàng của cấu hình xe */}
        <div
          className="grid gap-2 sm:gap-2.5 items-center justify-center"
          style={{
            gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
          }}
        >
          {/* Vô lăng đặt trực tiếp trong grid (như xe Limousine 9 chỗ) */}
          {hasDriverInsideGrid && layout.driver && (
            <div
              style={{
                gridRow: layout.driver.row,
                gridColumn: layout.driver.col,
              }}
              title="Vị trí tài xế"
              className="w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 mx-auto"
            >
              <Disc className="w-5 h-5" />
            </div>
          )}

          {floorSeats.map((seat) => renderSeat(seat))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Khối vẽ xe: Bo tròn phía trên mô phỏng đầu xe */}
      <div className="w-full max-w-lg bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col items-center">
        {/* Hai tầng luôn đặt cạnh nhau: Tầng A bên trái, Tầng B bên phải, tuyệt đối không có chữ 'Tầng dưới/trên' (B5.3) */}
        <div className="flex items-start justify-center gap-4 sm:gap-8 w-full overflow-x-auto py-2">
          {renderFloorGrid(1)}
          {layout.floors === 2 && renderFloorGrid(2)}
        </div>
      </div>

      {/* Chú giải trạng thái ghế (B5.6) */}
      <div className="w-full max-w-lg mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm border border-slate-400 bg-white" />
          <span>Trống</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm bg-[#C2410C] flex items-center justify-center text-white">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <span>Đang chọn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400">
            <X className="w-3 h-3" />
          </div>
          <span>Đã đặt</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm bg-slate-100 border border-dashed border-slate-400 flex items-center justify-center text-slate-500">
            <Clock className="w-2.5 h-2.5" />
          </div>
          <span>Đang giữ chỗ</span>
        </div>
      </div>

      {/* Chú giải nhóm màu vùng ghế (B5.5) */}
      {presentZones.length > 1 && (
        <div className="w-full max-w-lg mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500">
          {presentZones.map((z) => {
            const colors: Record<SeatZone, string> = {
              blue: 'bg-blue-500',
              purple: 'bg-purple-500',
              amber: 'bg-amber-500',
              green: 'bg-green-500',
            };
            return (
              <div key={z} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${colors[z]}`} />
                <span>{zoneNames[z]}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SeatMap;

