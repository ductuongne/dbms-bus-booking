import React from 'react';

export interface StatusDotProps {
  color?: 'green' | 'red' | 'yellow' | 'slate';
  pulse?: boolean;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  color = 'green',
  pulse = false,
  className = '',
}) => {
  const colorStyles = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-amber-500',
    slate: 'bg-slate-400',
  };

  const pingStyles = {
    green: 'bg-green-400',
    red: 'bg-red-400',
    yellow: 'bg-amber-400',
    slate: 'bg-slate-300',
  };

  return (
    <span className={`relative flex h-2 w-2 items-center justify-center ${className}`}>
      {pulse && (
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${pingStyles[color]}`}
        />
      )}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${colorStyles[color]}`} />
    </span>
  );
};

export default StatusDot;

