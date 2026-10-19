import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'inverse';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#C2410C] hover:bg-[#9A3412] text-white shadow-xs',
    secondary: 'bg-[#1E3A5F] hover:bg-[#162C48] text-white shadow-xs',
    outline: 'border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#0F172A]',
    danger: 'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-xs',
    ghost: 'hover:bg-slate-100 text-[#0F172A]',
    inverse: 'bg-white text-[#1E3A5F] hover:bg-slate-50 shadow-xs font-semibold',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};

export default Button;

