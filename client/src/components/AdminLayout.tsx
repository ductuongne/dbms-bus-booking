import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Bus, GitFork, MapPin, Grid, Layers, ShieldCheck, ArrowLeft } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const tabs = [
    { to: '/admin/vehicles', label: 'Quản lý Xe', icon: Bus },
    { to: '/admin/vehicle-types', label: 'Loại xe', icon: Layers },
    { to: '/admin/seat-layout', label: 'Sơ đồ Ghế', icon: Grid },
    { to: '/admin/routes', label: 'Tuyến đường', icon: GitFork },
    { to: '/admin/stations', label: 'Bến xe', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col">
      {/* Admin Sub-header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-gray-900 leading-tight">
                  Quản Trị Đội Xe, Tuyến &amp; Bến
                </h1>
                <span className="text-[11px] text-gray-500 font-medium">
                  Kết nối trực tiếp SQL Server • Phân hệ Quản trị viên
                </span>
              </div>
            </div>

            <Link
              to="/routes"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#FF385C] font-semibold transition-colors self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Xem giao diện Người dùng (Public)</span>
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

