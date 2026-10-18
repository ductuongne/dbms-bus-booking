import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bus, Ticket, Globe, Undo2, HelpCircle, User } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo RedBus */}
        <Link
          to="/"
          className="flex items-center gap-2 text-left cursor-pointer transition-transform hover:scale-102"
          aria-label="Về trang chủ RedBus"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FF385C] flex items-center justify-center text-white shadow-sm">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-[#FF385C]">
              red<span className="text-gray-900">Bus</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-6 text-sm text-gray-700">
          <Link
            to="/search?from=Hà Nội&to=Ninh Bình&date=2026-10-18"
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              currentPath === '/search'
                ? 'bg-rose-50 text-[#FF385C]'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Ticket className="w-4 h-4 text-gray-500" />
            <span>Tìm chuyến</span>
          </Link>

          <Link
            to="/payment"
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              currentPath === '/payment'
                ? 'bg-rose-50 text-[#FF385C]'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Ticket className="w-4 h-4 text-gray-500" />
            <span>Mã đặt vé</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-100 cursor-pointer">
            <Globe className="w-4 h-4 text-gray-500" />
            <span>Tiếng Việt</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-100 cursor-pointer">
            <Undo2 className="w-4 h-4 text-gray-500" />
            <span>Hủy vé</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-100 cursor-pointer">
            <HelpCircle className="w-4 h-4 text-gray-400" />
            <span>Hỗ trợ</span>
          </div>

          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100 hover:bg-gray-200 cursor-pointer text-gray-800 transition-colors"
          >
            <User className="w-4 h-4 text-gray-600" />
            <span>Tài khoản</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
