import type { Province } from '../types';

// ==========================================
// PROVINCES FALLBACK (Dùng khi mạng gián đoạn)
// Đồng bộ 8 tỉnh/thành chuẩn theo database (dbo.provinces)
// ==========================================
export const mockProvinces: Province[] = [
  { id: 'PRV-01', name: 'Hà Nội' },
  { id: 'PRV-02', name: 'Hồ Chí Minh' },
  { id: 'PRV-03', name: 'Đà Nẵng' },
  { id: 'PRV-04', name: 'Lâm Đồng' },
  { id: 'PRV-06', name: 'Hải Phòng' },
  { id: 'PRV-07', name: 'Khánh Hòa' },
  { id: 'PRV-08', name: 'Lào Cai' },
  { id: 'PRV-10', name: 'Cần Thơ' },
];
