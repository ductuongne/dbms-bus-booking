import React from 'react';
import type { UserRole } from '../../types/auth';

export interface BadgeProps {
  variant?:
    | 'neutral'
    | 'success'
    | 'warning'
    | 'danger'
    | 'brand'
    | 'action'
    | 'role'
    | 'status'
    | 'default';
  size?: 'sm' | 'md';
  role?: UserRole | string;
  isActive?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  STAFF: 'Nhân viên vé',
  DRIVER: 'Tài xế',
  CUSTOMER: 'Khách hàng',
  GUEST: 'Khách vãng lai',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  role,
  isActive,
  children,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-sm font-medium',
    md: 'text-xs px-2.5 py-1 rounded-md font-medium',
  };

  let colorClasses: string;

  if (variant === 'role' && role) {
    colorClasses = {
      ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
      STAFF: 'bg-blue-50 text-blue-700 border-blue-200',
      DRIVER: 'bg-amber-50 text-amber-700 border-amber-200',
      CUSTOMER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      GUEST: 'bg-slate-50 text-slate-600 border-slate-200',
    }[role] || 'bg-slate-100 text-slate-700 border-slate-200';
  } else if (variant === 'status' && typeof isActive === 'boolean') {
    colorClasses = isActive
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';
  } else {
    const semanticStyles: Record<string, string> = {
      neutral: 'bg-slate-100 text-slate-700 border-slate-200',
      success: 'bg-green-50 text-green-800 border-green-200',
      warning: 'bg-amber-50 text-amber-800 border-amber-200',
      danger: 'bg-red-50 text-red-800 border-red-200',
      brand: 'bg-blue-50 text-[#1E3A5F] border-blue-200 font-semibold',
      action: 'bg-orange-50 text-[#C2410C] border-orange-200 font-semibold',
      default: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    colorClasses = semanticStyles[variant] || semanticStyles.neutral;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 select-none border rounded-full ${sizeStyles[size]} ${colorClasses} ${className}`}
    >
      {variant === 'status' && typeof isActive === 'boolean' && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}
        />
      )}
      {children ||
        (variant === 'status' && typeof isActive === 'boolean'
          ? isActive
            ? 'Hoạt động'
            : 'Đã khóa'
          : variant === 'role' && role
          ? ROLE_LABELS[role] || role
          : null)}
    </span>
  );
};

export default Badge;
