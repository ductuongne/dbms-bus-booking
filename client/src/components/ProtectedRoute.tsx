import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth';

export interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { isAuthenticated, role, isInitialized } = useAuth();
  const location = useLocation();

  // 1. Chờ Hydration từ localStorage hoàn tất (tránh unauthenticated flash redirect khi F5)
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm font-medium text-slate-500">
            Đang xác thực bảo mật...
          </span>
        </div>
      </div>
    );
  }

  // 2. Kiểm tra Đăng nhập: Chưa đăng nhập -> Điều hướng sang /login, lưu lại trang đang truy cập
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Kiểm tra Phân quyền RBAC: Đã đăng nhập nhưng Role không nằm trong allowedRoles -> 403 Forbidden
  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 4. Hợp lệ: Render component con hoặc Outlet cho nested routes
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;

