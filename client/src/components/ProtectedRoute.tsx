import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { USER_ROLES } from '../constants';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [USER_ROLES.ADMIN, USER_ROLES.STAFF],
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const { warning } = useToast();
  const hasWarnedRef = useRef(false);

  useEffect(() => {
    if (user && !allowedRoles.includes(user.role) && !hasWarnedRef.current) {
      warning('Tài khoản của bạn không có quyền truy cập khu vực quản trị.');
      hasWarnedRef.current = true;
    }
  }, [user, allowedRoles, warning]);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
