import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Bus,
} from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import type { BookingCheckoutView } from '../types';
import { formatCurrency, formatFullDateVN } from '../utils';
import { bookingService } from '../services/booking.service';
import { paymentService } from '../services/payment.service';
import { useToast } from '../hooks/useToast';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error: errorToast } = useToast();

  const checkoutData = (location.state as { checkoutData?: BookingCheckoutView } | null)?.checkoutData;

  const totalAmount = checkoutData?.totalAmount || checkoutData?.finalAmount || 0;
  const [secondsLeft, setSecondsLeft] = useState(
    checkoutData?.payment.countdownSeconds || 900
  );
  const [isCopiedAccount, setIsCopiedAccount] = useState(false);
  const [isCopiedContent, setIsCopiedContent] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Real-time Countdown Timer (ERR-15, đếm ngược tự động)
  useEffect(() => {
    if (!checkoutData || secondsLeft <= 0 || isPaid) return;

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
  }, [checkoutData, secondsLeft, isPaid]);

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center max-w-md w-full">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Bus className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Không tìm thấy thông tin đơn hàng</h2>
          <p className="text-xs text-slate-500 mb-6">
            Phiên đặt vé đã kết thúc hoặc không có thông tin chuyến xe được chọn.
          </p>
          <Button variant="primary" className="w-full" onClick={() => navigate('/')}>
            Quay lại trang chủ tìm chuyến
          </Button>
        </div>
      </div>
    );
  }

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, type: 'account' | 'content') => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setIsCopiedAccount(true);
      success('Đã sao chép số tài khoản');
      setTimeout(() => setIsCopiedAccount(false), 2000);
    } else {
      setIsCopiedContent(true);
      success('Đã sao chép nội dung chuyển khoản');
      setTimeout(() => setIsCopiedContent(false), 2000);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setIsConfirming(true);
      await bookingService.confirmBooking(checkoutData.bookingId, {
        booking_code: checkoutData.bookingCode,
        phone: checkoutData.passenger.phone,
        payment_method: 'BANK_TRANSFER',
      });
      await paymentService.payBooking(checkoutData.bookingId, {
        booking_code: checkoutData.bookingCode,
        phone: checkoutData.passenger.phone,
        method: 'BANK_TRANSFER',
        transaction_code:
          checkoutData.payment.transferContent || `VQR-${checkoutData.bookingCode}`,
      });
      setIsPaid(true);
      success(`Thanh toán thành công! Vé điện tử đã gửi tới ${checkoutData.passenger.email}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Xác nhận thanh toán thất bại, vui lòng kiểm tra lại.';
      errorToast(msg);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* 1. Header Payment Bar (XeViet branding, countdown, tổng tiền) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center text-white">
                <Bus className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-[#1E3A5F]">
                Xe<span className="text-[#C2410C]">Viet</span>
              </span>
            </Link>

            <div className="hidden sm:block border-l border-slate-200 pl-6">
              <span className="text-sm font-bold text-slate-900">
                Thanh toán {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                secondsLeft <= 60
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Thời gian giữ chỗ:</span>
              <span className="font-mono font-bold text-sm tracking-wider">
                {formatCountdown(secondsLeft)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại các chuyến xe</span>
          </button>
        </div>

        {isPaid ? (
          /* Màn hình xác nhận thanh toán thành công (ERR-15, thay alert) */
          <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-black text-slate-900">Thanh toán thành công!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Mã đặt vé của bạn là: <strong className="text-[#1E3A5F]">{checkoutData.bookingCode}</strong>
            </p>

            <div className="w-full bg-slate-50 rounded-xl p-4 my-6 text-left text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Hành khách:</span>
                <span className="font-bold text-slate-800">{checkoutData.passenger.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số điện thoại:</span>
                <span className="font-bold text-slate-800">{checkoutData.passenger.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chuyến xe:</span>
                <span className="font-bold text-slate-800">
                  {checkoutData.trip.departureStation.name} → {checkoutData.trip.arrivalStation.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ghế ngồi:</span>
                <span className="font-bold text-[#1E3A5F]">
                  {checkoutData.selectedSeats.map((s) => s.label).join(', ')}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm">
                <span>Số tiền thanh toán:</span>
                <span className="text-[#C2410C]">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="primary" onClick={() => navigate('/')}>
                Về trang chủ XeViet
              </Button>
            </div>
          </div>
        ) : (
          /* Cột trái QR + Cột phải tóm tắt */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Cột trái: Quét mã VietQR */}
            <main className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col items-center">
              <div className="text-center space-y-1 mb-6">
                <Badge variant="brand" size="md">
                  Cổng thanh toán tự động VietQR
                </Badge>
                <h2 className="text-xl font-bold text-slate-900 mt-2">Quét mã QR để thanh toán</h2>
                <p className="text-xs text-slate-500">
                  Mở ứng dụng ngân hàng bất kỳ để quét mã QR và thanh toán giữ chỗ tức thì
                </p>
              </div>

              {/* QR Image */}
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-xs mb-6 max-w-[260px] w-full">
                <img
                  src={checkoutData.payment.qrImageUrl}
                  alt="Mã QR thanh toán VietQR"
                  className="w-full h-auto rounded-lg"
                />
              </div>

              {/* Chi tiết chuyển khoản */}
              <div className="w-full max-w-md bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <span className="font-bold text-slate-800">{checkoutData.payment.bankName}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {checkoutData.payment.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(checkoutData.payment.accountNumber, 'account')}
                      title="Sao chép số tài khoản"
                      className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                    >
                      {isCopiedAccount ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <span className="font-bold text-slate-800">{checkoutData.payment.accountName}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Số tiền:</span>
                  <span className="font-bold text-[#C2410C] text-sm">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#1E3A5F]">
                      {checkoutData.payment.transferContent}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(checkoutData.payment.transferContent, 'content')}
                      title="Sao chép nội dung chuyển khoản"
                      className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                    >
                      {isCopiedContent ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Nút xác nhận thanh toán */}
              <div className="w-full max-w-md mt-6 pt-4 border-t border-slate-200 flex flex-col gap-2">
                {secondsLeft <= 0 ? (
                  <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    Đã hết thời gian giữ chỗ vé. Vui lòng quay lại tìm và đặt chuyến mới.
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isConfirming}
                    disabled={isConfirming || secondsLeft <= 0}
                    onClick={handleConfirmPayment}
                  >
                    Xác nhận đã chuyển khoản thành công
                  </Button>
                )}
                <span className="text-[11px] text-slate-400 text-center">
                  Hệ thống tự động kích hoạt vé sau khi phát hiện giao dịch thành công.
                </span>
              </div>
            </main>

            {/* Cột phải: Tóm tắt thông tin vé */}
            <aside className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5 text-xs">
              <div className="pb-3 border-b border-slate-200">
                <h3 className="font-bold text-base text-slate-900">{checkoutData.trip.operator.name}</h3>
                <p className="text-slate-500 mt-0.5">
                  {checkoutData.trip.busType.name} • Biển số {checkoutData.trip.bus.licensePlate}
                </p>
              </div>

              {/* Lộ trình & Ngày giờ (ERR-07, format ngày động) */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-slate-700 font-medium">
                  {formatFullDateVN(checkoutData.trip.departureDate)}
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1E3A5F] mt-1 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{checkoutData.trip.departureTime}</span>
                    <span className="block text-slate-800 font-semibold">{checkoutData.pickupPoint.name}</span>
                    <span className="block text-[11px] text-slate-500">{checkoutData.pickupPoint.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-1 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{checkoutData.trip.arrivalTime}</span>
                    <span className="block text-slate-800 font-semibold">{checkoutData.dropoffPoint.name}</span>
                    <span className="block text-[11px] text-slate-500">{checkoutData.dropoffPoint.address}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin ghế và hành khách */}
              <div className="space-y-2 py-3 border-t border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Hành khách:</span>
                  <span className="font-semibold text-slate-900">{checkoutData.passenger.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số điện thoại:</span>
                  <span className="font-semibold text-slate-900">{checkoutData.passenger.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-900">{checkoutData.passenger.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ghế đã chọn:</span>
                  <span className="font-bold text-[#1E3A5F]">
                    {checkoutData.selectedSeats.map((s) => s.label).join(', ')}
                  </span>
                </div>
              </div>

              {/* Chi tiết thanh toán */}
              <div className="space-y-2 py-3 border-t border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Giá vé ({checkoutData.selectedSeats.length} ghế):</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí dịch vụ:</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold">
                  <span className="text-slate-900">Tổng thanh toán:</span>
                  <span className="text-[#C2410C] text-base">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Cam kết an toàn */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2.5 text-blue-900">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-[11px] leading-relaxed">
                  Giao dịch an toàn & được bảo chứng bởi Ngân hàng Nhà nước. Vé điện tử được xác nhận ngay tức thì.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
