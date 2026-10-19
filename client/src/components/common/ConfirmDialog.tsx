import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  danger = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          {danger && (
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          <p className="text-sm text-slate-600 leading-relaxed mt-1">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

