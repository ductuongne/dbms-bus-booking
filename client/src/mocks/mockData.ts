import type { Province } from '../types';

// ==========================================
// PROVINCES FALLBACK (Dùng khi mạng gián đoạn)
// ==========================================
export const mockProvinces: Province[] = [
  { id: 'PRV-01', name: 'Hà Nội' },
  { id: 'PRV-02', name: 'Hồ Chí Minh' },
  { id: 'PRV-03', name: 'Đà Nẵng' },
  { id: 'PRV-04', name: 'Lâm Đồng' },
  { id: 'PRV-05', name: 'Ninh Bình' },
  { id: 'PRV-06', name: 'Hải Phòng' },
  { id: 'PRV-07', name: 'Quảng Ninh' },
  { id: 'PRV-08', name: 'Thanh Hóa' },
];
