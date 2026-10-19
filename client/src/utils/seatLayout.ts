import type { BusLayoutConfig, SeatCell, SeatLayoutView, SeatStatus, SeatZone } from '../types';
import type { TripSeatItem } from '../services/trip.service';

/**
 * Chuyển đổi dữ liệu ghế từ API backend thành sơ đồ cấu trúc cho 3 loại xe:
 * 1. Xe Limousine 9 chỗ (1 tầng, khoang thương gia)
 * 2. Xe Limousine 22 chỗ (2 tầng, cabin VIP, 2 dãy, 1 lối đi rộng ở giữa)
 * 3. Xe Giường nằm 34 chỗ (2 tầng, 3 dãy, 2 lối đi chạy dọc xe)
 */
export function mapApiSeatsToLayout(
  apiSeats: TripSeatItem[],
  busId: string = 'BUS',
  busTypeName: string = 'Xe Khách'
): SeatLayoutView {
  const total = apiSeats.length;

  // Sắp xếp ghế tự nhiên theo chữ cái và số (A01..A17, B01..B17)
  const sortedSeats = [...apiSeats].sort((a, b) => {
    return a.seat_number.localeCompare(b.seat_number, undefined, { numeric: true });
  });

  // ========================================================
  // 1. LOẠI XE 9 CHỖ (Xe Limousine 9 chỗ)
  // ========================================================
  if (total <= 10) {
    const layoutConfig: BusLayoutConfig = {
      busTypeCode: 'BT-LIM-09',
      name: 'Xe Limousine 9 Chỗ',
      floors: 1,
      cols: 3,
      rows: 4,
      showFloorPrefix: false,
      driver: { floor: 1, row: 1, col: 1 },
    };

    // Bố trí khoang 9 chỗ chuẩn DCar VIP:
    // Hàng 1: Tài xế (cột 1) | Ghế 01 (cột 2) | Ghế 02 (cột 3)
    // Hàng 2: Ghế 03 (cột 1) | [Lối đi cột 2]  | Ghế 04 (cột 3)
    // Hàng 3: Ghế 05 (cột 1) | [Lối đi cột 2]  | Ghế 06 (cột 3)
    // Hàng 4: Ghế 07 (cột 1) | Ghế 08 (cột 2)  | Ghế 09 (cột 3)
    const posList = [
      { row: 1, col: 2, zone: 'purple' as SeatZone },
      { row: 1, col: 3, zone: 'purple' as SeatZone },
      { row: 2, col: 1, zone: 'amber' as SeatZone },
      { row: 2, col: 3, zone: 'amber' as SeatZone },
      { row: 3, col: 1, zone: 'amber' as SeatZone },
      { row: 3, col: 3, zone: 'amber' as SeatZone },
      { row: 4, col: 1, zone: 'green' as SeatZone },
      { row: 4, col: 2, zone: 'green' as SeatZone },
      { row: 4, col: 3, zone: 'green' as SeatZone },
    ];

    const seatCells: SeatCell[] = sortedSeats.map((s, idx) => {
      const pos =
        posList[idx] || {
          row: 1 + Math.floor(idx / 3),
          col: 1 + (idx % 3),
          zone: 'blue' as SeatZone,
        };

      const status: SeatStatus =
        s.status === 'CONFIRMED'
          ? 'BOOKED'
          : s.status === 'PENDING'
          ? 'HELD'
          : 'AVAILABLE';

      return {
        id: s.seat_id,
        label: s.seat_number,
        seatNumber: s.seat_number,
        floor: 1,
        row: pos.row,
        col: pos.col,
        zone: pos.zone,
        status,
        price: s.price,
      };
    });

    return {
      busId,
      busTypeCode: 'BT-LIM-09',
      busTypeName: 'Xe Limousine 9 Chỗ',
      floors: 1,
      totalSeats: seatCells.length,
      layoutConfig,
      seats: seatCells,
    };
  }

  // ========================================================
  // 2. LOẠI XE 22 CHỖ (Xe Limousine Giường Nằm 22 Phòng VIP)
  // ========================================================
  if (total <= 26) {
    const layoutConfig: BusLayoutConfig = {
      busTypeCode: 'BT-LIM-22',
      name: 'Xe Limousine 22 Phòng VIP',
      floors: 2,
      cols: 3, // Cột 1: Dãy Trái, Cột 2: Lối đi trung tâm, Cột 3: Dãy Phải
      rows: 6,
      showFloorPrefix: true,
      driver: { floor: 1, row: 0, col: 1 },
    };

    // Phân tầng: nếu có ký hiệu B thì chia theo A/B, ngược lại chia nửa đầu Tầng 1, nửa sau Tầng 2
    const hasFloorB = sortedSeats.some((s) => s.seat_number.toUpperCase().startsWith('B'));
    let floor1Seats: TripSeatItem[];
    let floor2Seats: TripSeatItem[];

    if (hasFloorB) {
      floor1Seats = sortedSeats.filter((s) => !s.seat_number.toUpperCase().startsWith('B'));
      floor2Seats = sortedSeats.filter((s) => s.seat_number.toUpperCase().startsWith('B'));
    } else {
      const half = Math.ceil(sortedSeats.length / 2);
      floor1Seats = sortedSeats.slice(0, half);
      floor2Seats = sortedSeats.slice(half);
    }

    const seatCells: SeatCell[] = [];

    // Mỗi tầng 11 cabin:
    // Hàng 1..5: Cột 1 (Dãy Trái: 01, 03, 05, 07, 09) & Cột 3 (Dãy Phải: 02, 04, 06, 08, 10). Cột 2 là lối đi rộng.
    // Hàng 6: Cột 1 (Cabin 11). Cột 3 là khu vực kỹ thuật / cửa thoát hiểm.
    const mapLim22 = (seats: TripSeatItem[], floorNum: 1 | 2) => {
      seats.forEach((s, idx) => {
        const num = idx + 1;
        let row: number;
        let col: number;
        if (num <= 10) {
          row = Math.ceil(num / 2);
          col = num % 2 === 1 ? 1 : 3;
        } else {
          row = 6;
          col = 1;
        }

        const status: SeatStatus =
          s.status === 'CONFIRMED'
            ? 'BOOKED'
            : s.status === 'PENDING'
            ? 'HELD'
            : 'AVAILABLE';

        seatCells.push({
          id: s.seat_id,
          label: s.seat_number,
          seatNumber: s.seat_number,
          floor: floorNum,
          row,
          col,
          zone: 'purple',
          status,
          price: s.price,
        });
      });
    };

    mapLim22(floor1Seats, 1);
    mapLim22(floor2Seats, 2);

    return {
      busId,
      busTypeCode: 'BT-LIM-22',
      busTypeName: 'Xe Limousine Giường Nằm 22',
      floors: 2,
      totalSeats: seatCells.length,
      layoutConfig,
      seats: seatCells,
    };
  }

  // ========================================================
  // 3. LOẠI XE 34 CHỖ (Xe Giường Nằm 34 Chỗ)
  // ========================================================
  const layoutConfig: BusLayoutConfig = {
    busTypeCode: 'BT-SLP-34',
    name: 'Xe Giường Nằm 34 Chỗ',
    floors: 2,
    cols: 5, // Cột 1: Dãy Trái | Cột 2: Lối đi 1 | Cột 3: Dãy Giữa | Cột 4: Lối đi 2 | Cột 5: Dãy Phải
    rows: 6,
    showFloorPrefix: true,
    driver: { floor: 1, row: 0, col: 1 },
  };

  const hasFloorB = sortedSeats.some((s) => s.seat_number.toUpperCase().startsWith('B'));
  let floor1Seats: TripSeatItem[];
  let floor2Seats: TripSeatItem[];

  if (hasFloorB) {
    floor1Seats = sortedSeats.filter((s) => !s.seat_number.toUpperCase().startsWith('B'));
    floor2Seats = sortedSeats.filter((s) => s.seat_number.toUpperCase().startsWith('B'));
  } else {
    const half = Math.ceil(sortedSeats.length / 2);
    floor1Seats = sortedSeats.slice(0, half);
    floor2Seats = sortedSeats.slice(half);
  }

  const seatCells: SeatCell[] = [];

  // Mỗi tầng 17 giường nằm chuẩn Thaco/Hyundai:
  // Hàng 1 (Đầu xe): Giường 1 (cột 1) | [Lối đi 1] | [Lối lên cửa col 3] | [Lối đi 2] | Giường 2 (cột 5)
  // Hàng 2..6: Mỗi hàng đủ 3 giường (Cột 1, Cột 3, Cột 5)
  const mapSlp34 = (seats: TripSeatItem[], floorNum: 1 | 2) => {
    seats.forEach((s, idx) => {
      const num = idx + 1;
      let row: number;
      let col: number;
      if (num === 1) {
        row = 1;
        col = 1;
      } else if (num === 2) {
        row = 1;
        col = 5;
      } else {
        const adj = num - 3;
        row = 2 + Math.floor(adj / 3);
        const rem = adj % 3;
        col = rem === 0 ? 1 : rem === 1 ? 3 : 5;
      }

      const status: SeatStatus =
        s.status === 'CONFIRMED'
          ? 'BOOKED'
          : s.status === 'PENDING'
          ? 'HELD'
          : 'AVAILABLE';

      seatCells.push({
        id: s.seat_id,
        label: s.seat_number,
        seatNumber: s.seat_number,
        floor: floorNum,
        row,
        col,
        zone: 'blue',
        status,
        price: s.price,
      });
    });
  };

  mapSlp34(floor1Seats, 1);
  mapSlp34(floor2Seats, 2);

  return {
    busId,
    busTypeCode: 'BT-SLP-34',
    busTypeName: busTypeName || 'Xe Giường Nằm 34 Chỗ',
    floors: 2,
    totalSeats: seatCells.length,
    layoutConfig,
    seats: seatCells,
  };
}
