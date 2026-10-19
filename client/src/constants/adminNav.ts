import {
  BarChart3,
  Calendar,
  MapPin,
  Building2,
  Bus,
  Layers,
  Grid,
  UserCheck,
  Ticket,
  Users,
  Shield,
} from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  { path: '/admin/reports', label: 'Báo cáo & Thống kê', icon: BarChart3 },
  { path: '/admin/trips', label: 'Quản lý chuyến xe', icon: Calendar },
  { path: '/admin/routes', label: 'Quản lý tuyến đường', icon: MapPin },
  { path: '/admin/stations', label: 'Quản lý bến xe', icon: Building2 },
  { path: '/admin/vehicles', label: 'Quản lý phương tiện', icon: Bus },
  { path: '/admin/vehicle-types', label: 'Loại phương tiện', icon: Layers },
  { path: '/admin/seat-layout', label: 'Sơ đồ ghế xe', icon: Grid },
  { path: '/admin/drivers', label: 'Quản lý tài xế', icon: UserCheck },
  { path: '/admin/bookings', label: 'Quản lý đặt vé', icon: Ticket },
  { path: '/admin/customers', label: 'Quản lý khách hàng', icon: Users },
  { path: '/admin/users', label: 'Quản lý tài khoản', icon: Shield },
];


