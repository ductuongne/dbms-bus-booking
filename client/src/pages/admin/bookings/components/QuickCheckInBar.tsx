import React from 'react';
import { QrCode, CheckCircle } from 'lucide-react';
import { Button } from '../../../../components/common';

export interface QuickCheckInBarProps {
  ticketCode: string;
  onTicketCodeChange: (value: string) => void;
  onSubmit: (ticketCode: string) => void;
  isLoading: boolean;
}

export const QuickCheckInBar: React.FC<QuickCheckInBarProps> = ({
  ticketCode,
  onTicketCodeChange,
  onSubmit,
  isLoading,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(ticketCode);
  };

  return (
    <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2B4C7E] p-4 sm:p-5 rounded-2xl text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <QrCode className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-bold text-sm sm:text-base">Check-in Nhanh bằng Mã Vé</h3>
          <p className="text-xs text-slate-300">Nhập mã vé hoặc mã QR của hành khách để xác nhận lên xe</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full md:w-auto">
        <input
          type="text"
          placeholder="Nhập mã vé (VD: TC-xxxx)..."
          value={ticketCode}
          onChange={(e) => onTicketCodeChange(e.target.value)}
          className="px-3.5 py-2 bg-white text-slate-900 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-full md:w-60"
          required
        />
        <Button
          variant="action"
          size="sm"
          type="submit"
          isLoading={isLoading}
          icon={<CheckCircle className="w-4 h-4" />}
        >
          Check-in
        </Button>
      </form>
    </div>
  );
};

export default QuickCheckInBar;
