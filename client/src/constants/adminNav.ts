import {
  BarChart3,
  Calendar,
  MapPin,
  Building2,
  Bus,
  Layers,
  UserCheck,
  Ticket,
  Users,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../types/auth';

export interface AdminNavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { path: '/admin/reports', label: 'Báo cáo & Thống kê', icon: BarChart3, roles: ['ADMIN'] },
  { path: '/admin/trips', label: 'Quản lý chuyến xe', icon: Calendar, roles: ['ADMIN', 'STAFF'] },
  { path: '/admin/routes', label: 'Quản lý tuyến đường', icon: MapPin, roles: ['ADMIN', 'STAFF'] },
  { path: '/admin/stations', label: 'Quản lý bến xe', icon: Building2, roles: ['ADMIN', 'STAFF'] },
  { path: '/admin/vehicles', label: 'Quản lý phương tiện', icon: Bus, roles: ['ADMIN', 'STAFF'] },
  { path: '/admin/vehicle-types', label: 'Loại phương tiện', icon: Layers, roles: ['ADMIN', 'STAFF'] },
  { path: '/admin/drivers', label: 'Quản lý tài xế', icon: UserCheck, roles: ['ADMIN', 'STAFF'] },
  { path: '/admin/bookings', label: 'Quản lý đặt vé', icon: Ticket, roles: ['ADMIN', 'STAFF'] },
  { path: '/admin/customers', label: 'Quản lý khách hàng', icon: Users, roles: ['ADMIN', 'STAFF'] },
  { path: '/admin/users', label: 'Quản lý tài khoản', icon: Shield, roles: ['ADMIN'] },
];



