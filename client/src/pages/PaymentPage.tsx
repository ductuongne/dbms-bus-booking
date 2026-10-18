import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User,
  Copy,
  Check,
  Bus,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { BookingCheckoutView } from '../types';
import { mockBookingCheckoutView } from '../mocks/mockData';

export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const checkoutData: BookingCheckoutView =
    (location.state as { checkoutData?: BookingCheckoutView } | null)?.checkoutData ||
    mockBookingCheckoutView;
  const [secondsLeft, setSecondsLeft] = useState(
    checkoutData.payment.countdownSeconds || 295 // 04:55
  );
  const [isCopiedAccount, setIsCopiedAccount] = useState(false);
  const [isCopiedContent, setIsCopiedContent] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Real-time Countdown Timer (04:55)
  useEffect(() => {
    if (secondsLeft <= 0 || isPaid) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, isPaid]);

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, type: 'account' | 'content') => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setIsCopiedAccount(true);
      setTimeout(() => setIsCopiedAccount(false), 2000);
    } else {
      setIsCopiedContent(true);
      setTimeout(() => setIsCopiedContent(false), 2000);
    }
  };

  const handleSimulatePayment = () => {
    setIsPaid(true);
    setTimeout(() => {
      alert(`Thanh toán thành công! Vé điện tử đã gửi tới email ${checkoutData.passenger.email}`);
      navigate('/');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col">
      {/* 1. Header Payment Bar (image_af37df.png) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FF385C] flex items-center justify-center text-white">
                <Bus className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-[#FF385C]">
                red<span className="text-gray-900">Bus</span>
              </span>
            </div>

            <div className="hidden sm:block border-l border-gray-200 pl-6">
              <span className="text-sm font-bold text-gray-900">
                Thanh toán {checkoutData.finalAmount.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-600 font-medium">
            {/* Countdown timer in bold amber / orange (image_af37df.png: 04:55) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span className="font-mono font-bold text-sm tracking-wider">
                {formatCountdown(secondsLeft)}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 hover:text-gray-900 cursor-pointer">
              <HelpCircle className="w-4 h-4 text-gray-400" />
              <span>Giúp đỡ</span>
            </div>

            <div className="flex items-center gap-1.5 hover:text-gray-900 cursor-pointer">
              <User className="w-4 h-4 text-gray-400" />
              <span>Tài khoản</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Checkout Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        {/* Back Link (image_af37df.png: ← Quay lại tất cả các thanh toán) */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-xs sm:text-sm font-semibold text-gray-700 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại tất cả các chuyến xe</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: VietQR Payment Box (image_af37df.png) */}
          <main className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-center gap-1.5">
                Thanh toán qua <span className="font-black text-rose-600">VietQR</span>
              </span>
              <h2 className="text-2xl font-bold text-gray-900">Quét và thanh toán</h2>
              <p className="text-xs text-gray-500">
                Sử dụng App ngân hàng hoặc ví điện tử bất kỳ để quét mã QR bên dưới
              </p>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="p-4 bg-white rounded-3xl border-2 border-gray-200/80 shadow-md relative group">
                {isPaid ? (
                  <div className="w-64 h-64 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center p-6 text-center text-emerald-800 space-y-3">
                    <CheckCircle2 className="w-16 h-16 text-emerald-600 animate-bounce" />
                    <h4 className="font-bold text-lg">Đã thanh toán thành công!</h4>
                    <p className="text-xs text-emerald-700">
                      Mã đặt vé <strong>{checkoutData.bookingCode}</strong> đã được xác nhận.
                    </p>
                  </div>
                ) : secondsLeft <= 0 ? (
                  <div className="w-64 h-64 rounded-2xl bg-red-50 border border-red-200 flex flex-col items-center justify-center p-6 text-center text-red-800 space-y-3">
                    <AlertCircle className="w-16 h-16 text-red-600" />
                    <h4 className="font-bold text-lg">Hết thời gian giữ chỗ</h4>
                    <p className="text-xs text-red-700">Vui lòng quay lại tìm chuyến xe để đặt vé mới.</p>
                  </div>
                ) : (
                  <img
                    src={checkoutData.payment.qrImageUrl}
                    alt={`VietQR thanh toán đặt vé ${checkoutData.bookingCode}`}
                    className="w-64 h-64 object-contain rounded-xl"
                  />
                )}
              </div>

              {/* Action: Lưu hình ảnh (image_af37df.png) */}
              <button
                type="button"
                onClick={() => window.open(checkoutData.payment.qrImageUrl, '_blank')}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#FF385C] cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Lưu hình ảnh</span>
              </button>
            </div>

            {/* Bank details breakdown */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Ngân hàng thụ hưởng:</span>
                <span className="font-bold text-gray-900">{checkoutData.payment.bankName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Số tài khoản:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(checkoutData.payment.accountNumber, 'account')}
                  className="font-mono font-bold text-gray-900 flex items-center gap-1 hover:text-[#FF385C] cursor-pointer"
                >
                  <span>{checkoutData.payment.accountNumber}</span>
                  {isCopiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Tên người thụ hưởng:</span>
                <span className="font-semibold text-gray-900">{checkoutData.payment.accountName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Số tiền:</span>
                <span className="font-bold text-base text-[#FF385C]">
                  {checkoutData.payment.amount.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Nội dung chuyển khoản:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(checkoutData.payment.transferContent, 'content')}
                  className="font-mono font-bold text-gray-900 flex items-center gap-1 hover:text-[#FF385C] cursor-pointer"
                >
                  <span>{checkoutData.payment.transferContent}</span>
                  {isCopiedContent ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Bank Partners Supported (image_af37df.png: Hỗ trợ nhiều ví điện tử và ngân hàng VPBank +37 hơn) */}
            <div className="pt-4 border-t border-gray-100 text-center space-y-2">
              <span className="text-[11px] text-gray-500">Hỗ trợ nhiều ví điện tử và ngân hàng</span>
              <div className="flex items-center justify-center gap-3 text-xs font-bold text-gray-700">
                <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg border border-red-100">VPBank</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">Vietcombank</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">MB Bank</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg font-medium">+37 hơn</span>
              </div>
            </div>

            {/* Interactive Simulation button */}
            {!isPaid && secondsLeft > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác nhận tôi đã chuyển khoản</span>
                </button>
              </div>
            )}
          </main>

          {/* Right Column: Order Summary (image_af37df.png) */}
          <aside aria-label="Tóm tắt đơn đặt vé" className="lg:col-span-5 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
            {/* Green Applied Deal Banner (image_af37df.png: 5.000đ Ưu đãi Deal Ưu đãi Đã áp dụng) */}
            <div className="bg-emerald-700 text-white text-center py-2.5 px-4 text-xs font-semibold">
              5.000đ Ưu đãi Deal Ưu đãi Đã áp dụng
            </div>

            <div className="p-6 space-y-5">
              {/* Operator details */}
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-base font-bold text-gray-900">{checkoutData.trip.operator.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {checkoutData.selectedSeats.length} Ghế ngồi • {checkoutData.trip.busType.name}
                </p>
              </div>

              {/* Itinerary timeline (image_af37df.png: 17:50 -> 19:30) */}
              <div className="space-y-4 relative pl-5 border-l-2 border-dashed border-gray-200 ml-2 text-xs">
                {/* Departure */}
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-gray-800 absolute -left-[27px] top-1" />
                  <div className="font-bold text-gray-900">
                    {checkoutData.trip.departureTime} <span className="text-gray-400 font-normal">Th10 18</span>
                  </div>
                  <p className="text-gray-700 font-medium mt-0.5">{checkoutData.pickupPoint.name}</p>
                  <p className="text-[11px] text-gray-400">{checkoutData.pickupPoint.address}</p>
                </div>

                <div className="text-[11px] text-gray-400 pl-1 font-medium">
                  {checkoutData.trip.durationFormatted}
                </div>

                {/* Arrival */}
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-emerald-600 absolute -left-[27px] top-1" />
                  <div className="font-bold text-gray-900">
                    {checkoutData.trip.arrivalTime} <span className="text-gray-400 font-normal">Th10 18</span>
                  </div>
                  <p className="text-gray-700 font-medium mt-0.5">{checkoutData.dropoffPoint.name}</p>
                  <p className="text-[11px] text-gray-400">{checkoutData.dropoffPoint.address}</p>
                </div>
              </div>

              {/* Passenger Info (image_af37df.png: Hành khách: ádfs, Số ghế ngồi: 15) */}
              <div className="border-t border-gray-100 pt-4 text-xs space-y-1">
                <h4 className="font-bold text-gray-800 mb-2">Hành khách</h4>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-900">{checkoutData.passenger.fullName}</span>
                  <span className="text-gray-500">
                    Số ghế ngồi{' '}
                    <strong className="text-gray-900">
                      {checkoutData.selectedSeats.map((s) => s.seatNumber).join(', ')}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Delivery contact (image_af37df.png: dfsdfs@gmail.com, 84328749584) */}
              <div className="border-t border-gray-100 pt-4 text-xs space-y-1">
                <h4 className="font-bold text-gray-800 mb-2">Vé của bạn sẽ được gửi đến</h4>
                <p className="text-gray-600">{checkoutData.passenger.email}</p>
                <p className="text-gray-600">{checkoutData.passenger.phone}</p>
              </div>

              {/* Price breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Giá vé gốc</span>
                  <span>{checkoutData.totalOriginalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
                {checkoutData.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Ưu đãi áp dụng</span>
                    <span>-{checkoutData.discountAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-100 text-sm">
                  <span className="font-bold text-gray-900">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-[#FF385C]">
                    {checkoutData.finalAmount.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
