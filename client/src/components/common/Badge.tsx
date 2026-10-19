import React from 'react';

export interface BadgeProps {
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-sm font-medium',
    md: 'text-xs px-2.5 py-1 rounded-md font-medium',
  };

  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-green-50 text-green-800 border border-green-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-red-50 text-red-800 border border-red-200',
    brand: 'bg-blue-50 text-[#1E3A5F] border border-blue-200 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;

