import React from 'react';
import { Check, X, Clock, Disc, ArrowUpRight } from 'lucide-react';
import type { BusLayoutConfig, SeatCell } from '../../types';

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
  const is9Seats = layout.busTypeCode === 'BT-LIM-09' || seats.length <= 10;
  const is22Seats = layout.busTypeCode === 'BT-LIM-22' || (seats.length > 10 && seats.length <= 26);
  const is34Seats = !is9Seats && !is22Seats;

  const renderSeat = (seat: SeatCell) => {
    const isSelected = selectedIds.includes(seat.id);
    const isBooked = seat.status === 'BOOKED';
    const isHeld = seat.status === 'HELD';
    const isAvailable = seat.status === 'AVAILABLE';

    let statusLabel = 'trống';
    if (isSelected) statusLabel = 'đang chọn';
    else if (isBooked) statusLabel = 'đã đặt';
    else if (isHeld) statusLabel = 'đang giữ chỗ';

    // Kích thước vừa vặn cho cả mobile và desktop khi hiện 2 tầng cùng lúc
    let sizeClasses = 'w-7 sm:w-8.5 h-8 sm:h-9.5 text-[10px] sm:text-[11px]';
    if (is9Seats) {
      sizeClasses = 'w-10 sm:w-11 h-10 sm:h-11 text-xs';
    } else if (is22Seats) {
      sizeClasses = 'w-8 sm:w-10 h-8.5 sm:h-10 text-[10px] sm:text-xs';
    }

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
        className={`relative flex flex-col items-center justify-between rounded-md sm:rounded-lg border font-bold select-none cursor-pointer p-0.5 sm:p-1 transition-colors ${sizeClasses} ${
          isSelected
            ? 'bg-[#C2410C] border-[#C2410C] text-white shadow-xs'
            : isBooked
            ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
            : isHeld
            ? 'bg-amber-50 border-dashed border-amber-300 text-amber-600 cursor-not-allowed'
            : 'bg-white border-slate-300 text-slate-700 hover:border-[#1E3A5F] hover:bg-slate-50'
        }`}
      >
        {/* Đệm đầu mô phỏng giường/ghế */}
        {!is9Seats ? (
          <div
            className={`w-3/4 h-1 rounded-full ${
              isSelected ? 'bg-white/50' : isBooked ? 'bg-slate-200' : isHeld ? 'bg-amber-200' : 'bg-slate-200'
            }`}
          />
        ) : (
          <div
            className={`w-1/2 h-1 rounded-full ${
              isSelected ? 'bg-white/50' : isBooked ? 'bg-slate-200' : 'bg-slate-200'
            }`}
          />
        )}

        {/* Mã ghế */}
        <span className="leading-none tracking-tight font-bold">
          {seat.label}
        </span>

        {/* Biểu tượng trạng thái */}
        <div className="h-2 sm:h-2.5 flex items-center justify-center">
          {isSelected && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white stroke-[3]" />}
          {isBooked && <X className="w-2 h-2 text-slate-300 stroke-[2.5]" />}
          {isHeld && <Clock className="w-2 h-2 text-amber-500" />}
        </div>
      </button>
    );
  };

  const renderFloorCoach = (floorNumber: 1 | 2) => {
    const floorSeats = seats.filter((s) => s.floor === floorNumber);
    const isFloor1 = floorNumber === 1;

    // Chiều rộng tối đa gọn gàng theo loại xe để 2 tầng luôn đứng cạnh nhau trên mobile
    let coachWidth = 'w-[140px] xs:w-[155px] sm:w-[185px]';
    if (is9Seats) coachWidth = 'w-[190px] sm:w-[220px]';
    else if (is22Seats) coachWidth = 'w-[130px] xs:w-[145px] sm:w-[175px]';

    return (
      <div className={`flex flex-col items-center shrink-0 ${coachWidth}`}>
        {/* Tiêu đề tầng */}
        {layout.floors === 2 && (
          <div className="mb-1.5 sm:mb-2">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold ${
                isFloor1
                  ? 'bg-blue-50 text-[#1E3A5F] border border-blue-100'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {isFloor1 ? 'Tầng 1 (Dưới)' : 'Tầng 2 (Trên)'}
            </span>
          </div>
        )}

        {/* Khung thân xe */}
        <div className="w-full bg-slate-50 border border-slate-300 rounded-t-xl sm:rounded-t-2xl rounded-b-lg sm:rounded-b-xl p-1.5 sm:p-3 flex flex-col items-center relative shadow-xs">
          {/* Kính chắn gió phía trước */}
          <div className="w-2/3 h-1 sm:h-1.5 bg-slate-200 rounded-full mb-1.5 sm:mb-2" />

          {/* Đầu xe: Buồng lái & Cửa lên xuống */}
          <div className="w-full pb-1 mb-1.5 sm:mb-2 border-b border-slate-200 flex items-center justify-between text-[9px] sm:text-[10px] font-medium text-slate-500 px-0.5">
            {isFloor1 ? (
              <>
                <div className="flex items-center gap-1 text-slate-600">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                    <Disc className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </div>
                  <span className="hidden xs:inline">Tài xế</span>
                </div>
                <div className="flex items-center gap-0.5 text-emerald-700">
                  <span>Cửa lên</span>
                  <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </div>
              </>
            ) : (
              <div className="w-full text-center text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400">
                Phía trước xe
              </div>
            )}
          </div>

          {/* Lưới ghế CSS Grid */}
          <div
            className="grid gap-1 sm:gap-1.5 items-center justify-center relative w-full"
            style={{
              gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
            }}
          >
            {/* Lối đi xe 34 chỗ (Cột 2 & Cột 4) */}
            {is34Seats && (
              <>
                <div
                  style={{ gridColumn: 2, gridRow: '1 / -1' }}
                  className="h-full border-r border-dashed border-slate-200 pointer-events-none"
                />
                <div
                  style={{ gridColumn: 4, gridRow: '1 / -1' }}
                  className="h-full border-r border-dashed border-slate-200 pointer-events-none"
                />
              </>
            )}

            {/* Lối đi trung tâm xe 22 chỗ (Cột 2) */}
            {is22Seats && (
              <div
                style={{ gridColumn: 2, gridRow: '1 / -1' }}
                className="h-full border-x border-dashed border-slate-200 pointer-events-none flex items-center justify-center"
              >
                <span className="text-[8px] sm:text-[9px] text-slate-300 font-bold uppercase rotate-90 select-none tracking-widest whitespace-nowrap">
                  Lối đi
                </span>
              </div>
            )}

            {/* Vô lăng xe 9 chỗ */}
            {is9Seats && layout.driver && (
              <div
                style={{
                  gridRow: layout.driver.row,
                  gridColumn: layout.driver.col,
                }}
                className="w-10 sm:w-11 h-10 sm:h-11 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-500 mx-auto"
              >
                <Disc className="w-4 h-4 text-slate-500" />
                <span className="text-[9px] font-medium mt-0.5">Tài xế</span>
              </div>
            )}

            {/* Danh sách ghế */}
            {floorSeats.map((seat) => renderSeat(seat))}
          </div>

          {/* Đuôi xe */}
          <div className="w-full mt-1.5 sm:mt-2 pt-1 border-t border-slate-200 text-center">
            <span className="text-[8px] sm:text-[9px] uppercase font-medium text-slate-400">
              Đuôi xe
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Sơ đồ xe: Hiển thị cả 2 tầng cạnh nhau trên cả Mobile và PC */}
      <div className="w-full flex flex-row items-start justify-center gap-2 xs:gap-3 sm:gap-6 py-0.5 overflow-x-auto">
        {layout.floors === 1 ? (
          renderFloorCoach(1)
        ) : (
          <>
            {renderFloorCoach(1)}
            {renderFloorCoach(2)}
          </>
        )}
      </div>

      {/* Chú giải trạng thái ghế tối giản */}
      <div className="w-full max-w-sm mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-[10px] sm:text-[11px] text-slate-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm border border-slate-300 bg-white" />
          <span>Ghế trống</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-[#C2410C] flex items-center justify-center text-white">
            <Check className="w-2 h-2 stroke-[3]" />
          </div>
          <span className="font-semibold text-slate-800">Đang chọn</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
            <X className="w-2 h-2" />
          </div>
          <span>Đã bán</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-amber-50 border border-dashed border-amber-300 flex items-center justify-center text-amber-600">
            <Clock className="w-1.5 h-1.5" />
          </div>
          <span>Đang giữ</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
