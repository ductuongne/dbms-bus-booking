/**
 * Các hàm tiện ích dùng chung cho ứng dụng XeViet
 */

/**
 * Trả về chuỗi YYYY-MM-DD theo giờ địa phương (tránh lệch ngày của toISOString())
 */
export function toLocalISODate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Thêm số ngày vào một Date object
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Định dạng tiền tệ VND (ví dụ: 180.000 đ)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

/**
 * Định dạng ngày dạng Việt Nam (DD/MM/YYYY)
 */
export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Lấy thứ và ngày đầy đủ (ví dụ: "Thứ Hai, 18/10/2026")
 */
export function formatFullDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  if (isNaN(date.getTime())) return dateStr;

  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayOfWeek = daysOfWeek[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${dayOfWeek}, ${day}/${month}/${year}`;
}

/**
 * Tạo nhãn ghế theo tầng và số thứ tự
 */
export function buildSeatLabel(floor: number, index: number, showFloorPrefix: boolean = true): string {
  const numStr = String(index).padStart(2, '0');
  if (!showFloorPrefix) {
    return numStr;
  }
  const prefix = floor === 1 ? 'A' : 'B';
  return `${prefix}${numStr}`;
}
