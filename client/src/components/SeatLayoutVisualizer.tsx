import React from 'react';
import type { SeatType } from '../types';

export interface VisualSeat {
  seatNumber: string;
  floor: number;
  seatType: SeatType | string;
}

interface SeatLayoutVisualizerProps {
  seats: VisualSeat[];
  floors?: number;
  interactive?: boolean;
  selectedSeats?: string[];
  onSelectSeat?: (seatNumber: string) => void;
  title?: string;
}

export const SeatLayoutVisualizer: React.FC<SeatLayoutVisualizerProps> = ({
  seats,
  floors = 1,
  interactive = false,
  selectedSeats = [],
  onSelectSeat,
  title,
}) => {
  const floor1Seats = seats.filter((s) => s.floor === 1);
  const floor2Seats = seats.filter((s) => s.floor === 2);
  const actualFloors = floor2Seats.length > 0 ? 2 : floors;

  const getSeatColor = (seatType: string, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-[#FF385C] text-white border-[#FF385C] shadow-md shadow-rose-500/30 scale-105';
    }
    switch (seatType) {
      case 'SLEEPER':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-400';
      case 'VIP':
        return 'bg-amber-50 text-amber-800 border-amber-200 hover:border-amber-400';
      case 'NORMAL':
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400';
    }
  };

  const renderFloorSeats = (floorSeats: VisualSeat[], floorNumber: number) => {
    return (
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex-1">
        {/* Floor Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <h4 className="font-bold text-gray-900 text-sm">Tầng {floorNumber}</h4>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md">
            {floorSeats.length} chỗ
          </span>
        </div>

        {/* Bus Cabin Front Indicator */}
        <div className="mb-4 pb-2 border-b border-dashed border-gray-200 flex items-center justify-between text-[11px] text-gray-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">
              ✇
            </span>
            <span>Vị trí tài xế</span>
          </div>
          <span>Cửa lên xuống ↗</span>
        </div>

        {/* Seats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {floorSeats.map((seat) => {
            const isSelected = selectedSeats.includes(seat.seatNumber);
            return (
              <button
                key={seat.seatNumber}
                type="button"
                disabled={!interactive}
                onClick={() => interactive && onSelectSeat && onSelectSeat(seat.seatNumber)}
                className={`py-3 px-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${getSeatColor(
                  seat.seatType,
                  isSelected
                )} ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className="font-mono font-black text-sm tracking-wide">
                  {seat.seatNumber}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider opacity-75">
                  {seat.seatType === 'SLEEPER'
                    ? 'Giường'
                    : seat.seatType === 'VIP'
                    ? 'VIP'
                    : 'Ghế'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <span className="text-xs font-medium text-gray-500">
            Tổng cộng: {seats.length} ghế
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium bg-gray-50 p-2.5 rounded-xl border border-gray-100">
        <span className="text-gray-400 text-[11px]">Chú thích:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-indigo-100 border border-indigo-300" />
          <span className="text-gray-700">Giường nằm (SLEEPER)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300" />
          <span className="text-gray-700">Ghế VIP</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-gray-100 border border-gray-300" />
          <span className="text-gray-700">Ghế Tiêu chuẩn (NORMAL)</span>
        </div>
      </div>

      {/* Floored Visual Grid */}
      <div className="flex flex-col md:flex-row gap-4">
        {renderFloorSeats(floor1Seats, 1)}
        {actualFloors === 2 && renderFloorSeats(floor2Seats, 2)}
      </div>
    </div>
  );
};

export default SeatLayoutVisualizer;

