import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Bus, ArrowLeft } from 'lucide-react';
import { ADMIN_NAV_ITEMS } from '../constants/adminNav';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const { user } = useAuth();
  const currentRole = user?.role;

  // Chỉ hiển thị các mục menu được cho phép đối với role hiện tại
  const visibleNavItems = ADMIN_NAV_ITEMS.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return currentRole ? item.roles.includes(currentRole) : false;
  });

  return (
    <aside className="w-60 h-full flex flex-col bg-[#1E3A5F] text-white">
      {/* Brand header */}
      <div className="h-16 px-5 flex items-center gap-2.5 border-b border-blue-900/40">
        <div className="w-8 h-8 rounded-lg bg-[#C2410C] flex items-center justify-center text-white">
          <Bus className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight">XeViet Admin</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto text-xs">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>


      {/* Back to website button */}
      <div className="p-3 border-t border-blue-900/40">
        <Link
          to="/"
          onClick={onItemClick}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ khách</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
