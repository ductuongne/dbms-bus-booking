import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Bus,
  Banknote,
  QrCode,
} from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import type { BookingCheckoutView } from '../types';
import { formatCurrency, formatFullDateVN } from '../utils';
import { bookingService } from '../services/booking.service';
import { paymentService } from '../services/payment.service';
import { VIETQR_CONFIG } from '../constants';
import { useToast } from '../hooks/useToast';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error: errorToast } = useToast();

  // Khôi phục dữ liệu checkout từ location.state hoặc sessionStorage (chống mất dữ liệu khi nhấn F5)
  const [checkoutData] = useState<BookingCheckoutView | null>(() => {
    const stateData = (location.state as { checkoutData?: BookingCheckoutView } | null)?.checkoutData;
    if (stateData) {
      sessionStorage.setItem('current_checkout_data', JSON.stringify(stateData));
      return stateData;
    }
    const saved = sessionStorage.getItem('current_checkout_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'CASH'>('BANK_TRANSFER');
  const totalAmount = checkoutData?.totalAmount || checkoutData?.finalAmount || 0;
  const [secondsLeft, setSecondsLeft] = useState(
    checkoutData?.payment?.countdownSeconds || VIETQR_CONFIG.DEFAULT_COUNTDOWN_SECONDS || 900
  );
  const [isCopiedAccount, setIsCopiedAccount] = useState(false);
  const [isCopiedContent, setIsCopiedContent] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Thông tin thanh toán VietQR với cơ chế fallback tự động
  const bankName = checkoutData?.payment?.bankName || VIETQR_CONFIG.DEFAULT_BANK;
  const accountNumber = checkoutData?.payment?.accountNumber || VIETQR_CONFIG.ACCOUNT_NUMBER;
  const accountName = checkoutData?.payment?.accountName || VIETQR_CONFIG.ACCOUNT_NAME;
  const transferContent = checkoutData?.payment?.transferContent || (checkoutData ? `Daisy Booking ${checkoutData.bookingCode}` : '');

  // Tính toán URL ảnh VietQR chuẩn xác, tự động fallback nếu URL trước đó bị thiếu tham số
  const rawQrUrl = checkoutData?.payment?.qrImageUrl || '';
  const qrImageUrl = (rawQrUrl && !rawQrUrl.includes('/image/--') && !rawQrUrl.includes('/image/-'))
    ? rawQrUrl
    : `https://img.vietqr.io/image/${VIETQR_CONFIG.BANK_BIN}-${accountNumber}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(
        transferContent
      )}&accountName=${encodeURIComponent(accountName)}`;

  // Real-time Countdown Timer (đếm ngược giữ chỗ tự động)
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
      // Bước 1: Xác nhận đơn đặt vé với phương thức thanh toán đã chọn
      await bookingService.confirmBooking(checkoutData.bookingId, {
        booking_code: checkoutData.bookingCode,
        phone: checkoutData.passenger.phone,
        payment_method: paymentMethod,
      });

      // Bước 2: Gọi thủ tục thanh toán ACID (sp_ThanhToan)
      await paymentService.payBooking(checkoutData.bookingId, {
        booking_code: checkoutData.bookingCode,
        phone: checkoutData.passenger.phone,
        method: paymentMethod,
        transaction_code:
          paymentMethod === 'BANK_TRANSFER'
            ? checkoutData.payment.transferContent || `VQR-${checkoutData.bookingCode}`
            : undefined,
      });

      setIsPaid(true);
      sessionStorage.removeItem('current_checkout_data');
      success(
        paymentMethod === 'BANK_TRANSFER'
          ? `Thanh toán thành công! Vé điện tử đã gửi tới ${checkoutData.passenger.email}`
          : `Đặt vé thành công! Bạn có thể thanh toán tiền mặt khi lên xe.`
      );
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-left">
      {/* 1. Header Payment Bar */}
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

        {/* Trạng thái đã thanh toán thành công */}
        {isPaid ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-xl mx-auto flex flex-col items-center text-center space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900">
                {paymentMethod === 'BANK_TRANSFER' ? 'Thanh toán thành công!' : 'Đặt vé thành công!'}
              </h1>
              <p className="text-xs text-slate-500">
                Mã đơn hàng: <strong className="font-mono text-slate-900">{checkoutData.bookingCode}</strong>
              </p>
            </div>

            <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-700 space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Hành khách:</span>
                <span className="font-bold">{checkoutData.passenger.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số điện thoại:</span>
                <span className="font-mono">{checkoutData.passenger.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phương thức:</span>
                <span className="font-bold">
                  {paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản VietQR' : 'Tiền mặt khi lên xe'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ghế ngồi:</span>
                <span className="font-bold text-[#1E3A5F]">
                  {checkoutData.selectedSeats.map((s) => s.label).join(', ')}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm">
                <span>Số tiền:</span>
                <span className="text-[#C2410C]">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/tra-cuu-ve?code=${checkoutData.bookingCode}`)}
              >
                Xem chi tiết vé điện tử
              </Button>
              <Button variant="primary" onClick={() => navigate('/')}>
                Về trang chủ
              </Button>
            </div>
          </div>
        ) : (
          /* Cột trái Phương thức thanh toán + Cột phải tóm tắt */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Cột trái */}
            <main className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col items-center">
              {/* Lựa chọn phương thức thanh toán */}
              <div className="w-full mb-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Chọn phương thức thanh toán
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'border-[#1E3A5F] bg-blue-50/40 ring-2 ring-[#1E3A5F]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        paymentMethod === 'BANK_TRANSFER'
                          ? 'bg-[#1E3A5F] text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">Chuyển khoản VietQR</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Quét mã ngân hàng tự động</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      paymentMethod === 'CASH'
                        ? 'border-[#1E3A5F] bg-blue-50/40 ring-2 ring-[#1E3A5F]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        paymentMethod === 'CASH'
                          ? 'bg-[#1E3A5F] text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">Tiền mặt tại quầy / xe</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Thanh toán khi lên xe</p>
                    </div>
                  </button>
                </div>
              </div>

              {paymentMethod === 'BANK_TRANSFER' ? (
                <>
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
                  <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-xs mb-6 max-w-[260px] w-full flex flex-col items-center">
                    <img
                      src={qrImageUrl}
                      alt="Mã QR thanh toán VietQR"
                      className="w-full h-auto rounded-lg"
                      onError={(e) => {
                        // Fallback sang QR generator tiêu chuẩn nếu vietqr.io gặp sự cố mạng
                        const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                          `2|99|${accountNumber}|${accountName}||0|0|${totalAmount}|${transferContent}|transfer_myqr`
                        )}`;
                        if (e.currentTarget.src !== fallbackUrl) {
                          e.currentTarget.src = fallbackUrl;
                        }
                      }}
                    />
                    <p className="text-[11px] text-slate-500 mt-2 font-medium">Quét bằng ứng dụng ngân hàng / MoMo</p>
                  </div>

                  {/* Chi tiết chuyển khoản */}
                  <div className="w-full max-w-md bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs mb-6">
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500">Ngân hàng:</span>
                      <span className="font-bold text-slate-800">{bankName}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500">Số tài khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(accountNumber, 'account')}
                          title="Sao chép số tài khoản"
                          className="p-1 rounded-sm hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                        >
                          {isCopiedAccount ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500">Chủ tài khoản:</span>
                      <span className="font-bold text-slate-800">{accountName}</span>
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
                          {transferContent}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(transferContent, 'content')}
                          title="Sao chép nội dung chuyển khoản"
                          className="p-1 rounded-sm hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                        >
                          {isCopiedContent ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Giao diện Thanh toán Tiền mặt */
                <div className="w-full space-y-4 mb-6">
                  <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                      <Banknote className="w-5 h-5 text-amber-600" />
                      Quy trình thanh toán tiền mặt
                    </div>
                    <p className="leading-relaxed text-slate-700">
                      Bạn đã chọn phương thức <strong>Thanh toán tiền mặt</strong>. Khi nhấn nút xác nhận bên dưới:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                      <li>Hệ thống sẽ xác nhận đặt chỗ của bạn và cấp mã vé điện tử chính thức.</li>
                      <li>Bạn sẽ thanh toán số tiền <strong>{formatCurrency(totalAmount)}</strong> trực tiếp cho nhân viên hoặc tài xế khi lên xe.</li>
                      <li>Vui lòng có mặt tại bến xe trước giờ khởi hành ít nhất 15 phút.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Số tiền cần thanh toán khi lên xe:</span>
                    <span className="text-base font-bold text-[#C2410C]">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              )}

              {/* Nút bấm xác nhận */}
              <div className="w-full max-w-md">
                <Button
                  variant="primary"
                  className="w-full py-3"
                  onClick={handleConfirmPayment}
                  isLoading={isConfirming}
                  disabled={secondsLeft <= 0}
                >
                  {paymentMethod === 'BANK_TRANSFER'
                    ? 'Tôi đã hoàn tất chuyển khoản VietQR'
                    : 'Xác nhận đặt chỗ & Thanh toán tiền mặt'}
                </Button>
              </div>
            </main>

            {/* Cột phải: Tóm tắt thông tin chuyến xe */}
            <aside className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <Bus className="w-4 h-4 text-[#1E3A5F]" />
                  <span>Chi tiết hành trình</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Tuyến đường:</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      {checkoutData.trip.departureStation.name} → {checkoutData.trip.arrivalStation.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block">Khởi hành:</span>
                      <strong className="text-slate-800 text-xs mt-0.5 block">
                        {checkoutData.trip.departureTime}
                      </strong>
                      <span className="text-slate-500 text-[11px]">
                        {formatFullDateVN(checkoutData.trip.departureDate)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Dự kiến đến:</span>
                      <strong className="text-slate-800 text-xs mt-0.5 block">
                        {checkoutData.trip.arrivalTime}
                      </strong>
                      <span className="text-slate-500 text-[11px]">
                        {formatFullDateVN(checkoutData.trip.departureDate)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bến đi:</span>
                      <span className="font-semibold text-slate-800">
                        {checkoutData.trip.departureStation.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bến đến:</span>
                      <span className="font-semibold text-slate-800">
                        {checkoutData.trip.arrivalStation.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phương tiện:</span>
                      <span className="font-semibold text-slate-800">
                        {checkoutData.trip.busType?.name || 'Xe khách'} ({checkoutData.trip.bus?.licensePlate || 'Tiêu chuẩn'})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin vé và hành khách */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Thông tin hành khách &amp; Ghế ngồi
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Họ tên:</span>
                    <span className="font-semibold text-slate-900">{checkoutData.passenger.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số điện thoại:</span>
                    <span className="font-mono text-slate-900">{checkoutData.passenger.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-700">{checkoutData.passenger.email}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Ghế đã chọn ({checkoutData.selectedSeats.length}):</span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {checkoutData.selectedSeats.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 bg-blue-50 text-[#1E3A5F] rounded-md font-bold text-xs"
                        >
                          {s.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-lg text-[#C2410C] font-black">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
