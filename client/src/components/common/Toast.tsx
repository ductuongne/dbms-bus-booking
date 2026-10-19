import React, { useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastContext, type ToastItem, type ToastType } from '../../hooks/useToast';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, message };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string, d?: number) => showToast(msg, 'success', d), [showToast]);
  const error = useCallback((msg: string, d?: number) => showToast(msg, 'error', d), [showToast]);
  const warning = useCallback((msg: string, d?: number) => showToast(msg, 'warning', d), [showToast]);
  const info = useCallback((msg: string, d?: number) => showToast(msg, 'info', d), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <aside
        aria-label="Thông báo hệ thống"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
            info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
          };

          const borderColors = {
            success: 'border-green-200 bg-white text-slate-900',
            error: 'border-red-200 bg-white text-slate-900',
            warning: 'border-amber-200 bg-white text-slate-900',
            info: 'border-blue-200 bg-white text-slate-900',
          };

          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm animate-in slide-in-from-bottom-2 duration-200 ${borderColors[toast.type]}`}
            >
              {icons[toast.type]}
              <span className="flex-1 font-medium">{toast.message}</span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Đóng thông báo"
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
};

export default ToastProvider;

