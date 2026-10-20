import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bus,
  Ticket,
  Navigation,
  Phone,
  Search,
  User,
  ShieldCheck,
  CalendarClock,
  LogOut,
  LogIn,
  Menu,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { BRAND_INFO, USER_ROLES } from '../constants';
import Drawer from './common/Drawer';
import Badge from './common/Badge';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdminOrStaff =
    user && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.STAFF);
  const isDriver = user && user.role === USER_ROLES.DRIVER;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo Daisy Booking */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-left cursor-pointer transition-transform hover:scale-102 shrink-0"
          aria-label="Về trang chủ Daisy Booking"
        >
          <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] flex items-center justify-center text-white shadow-xs">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-[#1E3A5F]">
              Xe<span className="text-[#C2410C]">Viet</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-sm text-slate-700">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentPath === '/'
                ? 'bg-blue-50 text-[#1E3A5F] font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Ticket className="w-4 h-4 text-slate-500" />
            <span>Tìm chuyến</span>
          </Link>

          <Link
            to="/routes"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentPath.startsWith('/routes')
                ? 'bg-blue-50 text-[#1E3A5F] font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Navigation className="w-4 h-4 text-slate-500" />
            <span>Tuyến đường</span>
          </Link>

          <Link
            to="/tra-cuu-ve"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentPath.startsWith('/tra-cuu-ve')
                ? 'bg-blue-50 text-[#1E3A5F] font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Tra cứu vé</span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Phone className="w-4 h-4 text-[#C2410C]" />
            <span>Hotline: {BRAND_INFO.hotline}</span>
          </div>

          {isAdminOrStaff && (
            <Link
              to={user?.role === USER_ROLES.ADMIN ? '/admin/reports' : '/admin/trips'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-[#1E3A5F] hover:bg-blue-100 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{user?.role === USER_ROLES.ADMIN ? 'Quản trị hệ thống' : 'Quản lý vận hành'}</span>
            </Link>
          )}


          {isDriver && (
            <Link
              to="/driver/schedules"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
            >
              <CalendarClock className="w-4 h-4" />
              <span>Lịch chạy tài xế</span>
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 leading-tight max-w-[130px] truncate">
                    {user.fullName}
                  </span>
                  <div className="mt-0.5">
                    <Badge variant="brand" size="sm">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất"
                aria-label="Đăng xuất"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>Đăng nhập</span>
              </Link>

              <Link
                to="/register"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1E3A5F] hover:bg-[#162C48] text-white shadow-xs transition-colors"
              >
                <span>Đăng ký</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Controls */}
        <div className="flex items-center md:hidden gap-2">
          {isAuthenticated && user ? (
            <span className="text-xs font-medium text-slate-700 truncate max-w-[110px]">
              {user.fullName || user.userId}
            </span>
          ) : (
            <Link
              to="/login"
              className="text-xs font-semibold text-[#1E3A5F] px-2.5 py-1.5 rounded-lg bg-blue-50"
            >
              Đăng nhập
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Mở menu"
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Menu Daisy Booking"
      >
        <div className="flex flex-col gap-4 text-sm">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 font-medium text-slate-800"
          >
            <Ticket className="w-5 h-5 text-[#1E3A5F]" />
            <span>Tìm chuyến</span>
          </Link>

          <Link
            to="/routes"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 font-medium text-slate-800"
          >
            <Navigation className="w-5 h-5 text-[#1E3A5F]" />
            <span>Mạng lưới tuyến đường</span>
          </Link>

          <Link
            to="/tra-cuu-ve"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 font-medium text-slate-800"
          >
            <Search className="w-5 h-5 text-[#1E3A5F]" />
            <span>Tra cứu vé</span>
          </Link>

          <div className="flex items-center gap-2 p-2.5 text-xs text-slate-600 bg-slate-50 rounded-lg">
            <Phone className="w-4 h-4 text-[#C2410C]" />
            <span>Hotline: {BRAND_INFO.hotline}</span>
          </div>

          {isAdminOrStaff && (
            <Link
              to={user?.role === USER_ROLES.ADMIN ? '/admin/reports' : '/admin/trips'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 text-[#1E3A5F] font-semibold text-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{user?.role === USER_ROLES.ADMIN ? 'Trang quản trị' : 'Quản lý vận hành'}</span>
            </Link>
          )}


          {isDriver && (
            <Link
              to="/driver/schedules"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 text-amber-800 font-semibold text-xs"
            >
              <CalendarClock className="w-4 h-4" />
              <span>Lịch chạy tài xế</span>
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
              <div className="text-xs text-slate-500">
                Đăng nhập với: <strong className="text-slate-800">{user.fullName || user.userId}</strong> ({user.role})
              </div>
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#1E3A5F] text-white font-semibold text-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </Link>

              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                <span>Đăng ký</span>
              </Link>
            </div>
          )}
        </div>
      </Drawer>
    </header>
  );
};

export default Header;
