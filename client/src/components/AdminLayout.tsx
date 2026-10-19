import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import Sidebar from './Sidebar';
import { ADMIN_NAV_ITEMS } from '../constants/adminNav';
import Drawer from './common/Drawer';
import Badge from './common/Badge';
import { useAuth } from '../hooks/useAuth';

export const AdminLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const currentItem = ADMIN_NAV_ITEMS.find((item) => item.path === location.pathname);
  const pageTitle = currentItem ? currentItem.label : 'Quản trị hệ thống';

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-60 shrink-0 sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      <Drawer
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        title="Quản trị XeViet"
      >
        <div className="-m-5">
          <Sidebar onItemClick={() => setIsMobileSidebarOpen(false)} />
        </div>
      </Drawer>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Mở menu quản trị"
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 leading-tight">
                    {user.fullName}
                  </span>
                  <div className="mt-0.5">
                    <Badge variant="brand" size="sm">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={logout}
              title="Đăng xuất"
              aria-label="Đăng xuất khỏi quản trị"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Page Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
