import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Bus, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { BRAND_INFO } from '../constants';
import Button from './common/Button';
import Badge from './common/Badge';

export const DriverLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-lg font-black text-brand hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center text-white shadow-xs">
              <Bus className="w-4 h-4" />
            </div>
            <span>
              Xe<span className="text-action">Viet</span>
            </span>
          </Link>
          <Badge variant="warning" className="hidden sm:inline-flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Tài Xế
          </Badge>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {user.fullName || 'Tài xế'}
                </span>
                <span className="text-[11px] text-slate-500">{user.phone}</span>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            icon={<LogOut className="w-4 h-4 text-slate-500" />}
            onClick={handleLogout}
            aria-label="Đăng xuất"
            className="hover:text-rose-600 hover:bg-rose-50"
          >
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {BRAND_INFO.name} — Hệ thống quản lý vận tải hành khách liên tỉnh
      </footer>
    </div>
  );
};

export default DriverLayout;
