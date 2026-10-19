import React from 'react';

export interface CardProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  padding = 'md',
  header,
  footer,
  children,
  className = '',
  onClick,
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xs transition-shadow ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      } ${className}`}
    >
      {header && (
        <div className="border-b border-slate-100 px-5 py-3.5 font-semibold text-slate-800">
          {header}
        </div>
      )}

      <div className={paddingStyles[padding]}>{children}</div>

      {footer && (
        <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50 rounded-b-xl text-xs text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

