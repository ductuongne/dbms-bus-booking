import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Check,
  CheckCircle2,
  User,
  Phone,
  Mail,
  ArrowRight,
  ArrowLeft,
  Info,
  Loader2,
  MapPin,
  Clock,
} from 'lucide-react';
import type { TripCardView, BookingCheckoutView, StopPointView, SeatLayoutView } from '../types';
import { VIETQR_CONFIG } from '../constants';
import { formatCurrency } from '../utils';
import { mapApiSeatsToLayout } from '../utils/seatLayout';
import { tripService } from '../services/trip.service';
import { bookingService } from '../services/booking.service';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import SeatMap from './booking/SeatMap';
import Button from './common/Button';

export interface SeatSelectionModalProps {
  trip: TripCardView;
  onClose: () => void;
  onProceedToCheckout: (checkoutData: BookingCheckoutView) => void;
}

type StepKey = 'SEATS' | 'STOPS' | 'PASSENGER';

export const SeatSelectionModal: React.FC<SeatSelectionModalProps> = ({
  trip,
  onClose,
  onProceedToCheckout,
}) => {
  const { user } = useAuth();
  const { warning, error: errorToast } = useToast();

  const [seatLayout, setSeatLayout] = useState<SeatLayoutView | null>(null);
  const [isLoadingSeats, setIsLoadingSeats] = useState<boolean>(true);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<StepKey>('SEATS');
  const [isHolding, setIsHolding] = useState<boolean>(false);

  // Điểm đón & Điểm trả
  const [selectedPickupId, setSelectedPickupId] = useState<string>(
    trip.pickupPoints[0]?.id || ''
  );
  const [selectedDropoffId, setSelectedDropoffId] = useState<string>(
    trip.dropoffPoints[0]?.id || ''
  );

  // Thông tin hành khách (tự động khởi tạo từ tài khoản đăng nhập nếu có)
  const [passengerName, setPassengerName] = useState(() => user?.fullName || '');
  const [passengerPhone, setPassengerPhone] = useState(() => user?.phone || '');
  const [passengerEmail, setPassengerEmail] = useState(() => user?.email || '');
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string; email?: string }>({});

  // Load ghế thực tế từ API backend
  useEffect(() => {
    let ignore = false;
    tripService
      .getTripSeats(trip.id)
      .then((res) => {
        if (!ignore && res && Array.isArray(res.seats)) {
          const layout = mapApiSeatsToLayout(res.seats, trip.bus.id, trip.busType.name);
          setSeatLayout(layout);
        }
      })
      .catch((err) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Không thể tải sơ đồ ghế';
          errorToast(msg);
        }
      })
      .finally(() => {
        if (!ignore) setIsLoadingSeats(false);
      });

    return () => {
      ignore = true;
    };
  }, [trip.id, trip.bus.id, trip.busType.name, errorToast]);

  // Bắt phím Escape để đóng modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleToggleSeat = (seatId: string) => {
    if (selectedSeatIds.includes(seatId)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seatId));
    } else {
      if (selectedSeatIds.length >= 5) {
        warning('Mỗi lần đặt vé bạn chỉ được chọn tối đa 5 ghế ngồi.');
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seatId]);
    }
  };

  const selectedSeatsList = seatLayout
    ? seatLayout.seats.filter((s) => selectedSeatIds.includes(s.id))
    : [];

  // Tổng tiền = tổng giá của các ghế đã chọn (hoặc giá vé chuyến × số ghế)
  const totalPrice = selectedSeatsList.reduce(
    (sum, s) => sum + (s.price || trip.price),
    0
  );

  const selectedPickup =
    trip.pickupPoints.find((p) => p.id === selectedPickupId) || trip.pickupPoints[0];
  const selectedDropoff =
    trip.dropoffPoints.find((p) => p.id === selectedDropoffId) || trip.dropoffPoints[0];

  const handleNextStep = async () => {
    if (currentStep === 'SEATS') {
      if (selectedSeatIds.length === 0) {
        warning('Vui lòng chọn ít nhất một ghế ngồi để tiếp tục.');
        return;
      }
      setCurrentStep('STOPS');
    } else if (currentStep === 'STOPS') {
      if (!selectedPickup || !selectedDropoff) {
        warning('Vui lòng chọn điểm đón và điểm trả.');
        return;
      }
      setCurrentStep('PASSENGER');
    } else if (currentStep === 'PASSENGER') {
      const errors: { name?: string; phone?: string; email?: string } = {};
      if (!passengerName.trim()) {
        errors.name = 'Vui lòng nhập họ và tên hành khách';
      }
      if (!passengerPhone.trim()) {
        errors.phone = 'Vui lòng nhập số điện thoại';
      } else if (!/^[0-9]{9,11}$/.test(passengerPhone.trim())) {
        errors.phone = 'Số điện thoại không hợp lệ (9-11 chữ số)';
      }
      if (!passengerEmail.trim()) {
        errors.email = 'Vui lòng nhập địa chỉ email nhận vé';
      } else if (!/\S+@\S+\.\S+/.test(passengerEmail.trim())) {
        errors.email = 'Email không hợp lệ';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      // Giữ chỗ vé thực tế trên database qua API POST /api/bookings/hold
      try {
        setIsHolding(true);
        const holdRes = await bookingService.holdBooking({
          customer_id: user?.userId,
          trip_id: trip.id,
          passengers: selectedSeatsList.map((seat) => ({
            seat_id: seat.id,
            name: passengerName.trim(),
            phone: passengerPhone.trim(),
          })),
          channel: 'ONLINE',
          email: passengerEmail.trim(),
        });

        const checkoutPayload: BookingCheckoutView = {
          bookingId: holdRes.booking_id,
          bookingCode: holdRes.booking_code,
          trip,
          selectedSeats: selectedSeatsList,
          pickupPoint: selectedPickup,
          dropoffPoint: selectedDropoff,
          passenger: {
            fullName: passengerName.trim(),
            phone: passengerPhone.trim(),
            email: passengerEmail.trim(),
          },
          totalAmount: holdRes.total_amount,
          totalOriginalAmount: holdRes.total_amount,
          discountAmount: 0,
          finalAmount: holdRes.total_amount,
          payment: {
            bankName: VIETQR_CONFIG.DEFAULT_BANK,
            bankBin: VIETQR_CONFIG.BANK_BIN,
            accountNumber: VIETQR_CONFIG.ACCOUNT_NUMBER,
            accountName: VIETQR_CONFIG.ACCOUNT_NAME,
            amount: holdRes.total_amount,
            transferContent: `Daisy Booking ${holdRes.booking_code}`,
            qrImageUrl: `https://img.vietqr.io/image/${VIETQR_CONFIG.BANK_BIN}-${VIETQR_CONFIG.ACCOUNT_NUMBER}-compact2.png?amount=${holdRes.total_amount}&addInfo=Daisy Booking%20${holdRes.booking_code}&accountName=${encodeURIComponent(
              VIETQR_CONFIG.ACCOUNT_NAME
            )}`,
            countdownSeconds: VIETQR_CONFIG.DEFAULT_COUNTDOWN_SECONDS,
          },
        };

        onProceedToCheckout(checkoutPayload);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Có lỗi xảy ra khi giữ chỗ vé. Vui lòng thử lại!';
        errorToast(msg);
      } finally {
        setIsHolding(false);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chọn chỗ ngồi chuyến xe"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header & Progress Stepper */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {trip.departureStation.name} → {trip.arrivalStation.name}
              </h2>
              <p className="text-xs text-slate-500 truncate">
                {trip.operator.name} • {trip.departureTime} ({trip.departureDate}) • {trip.busType.name}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng bảng chọn ghế"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between max-w-md mx-auto">
            {/* Step 1: Chọn ghế */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep === 'SEATS'
                    ? 'bg-[#1E3A5F] text-white ring-2 ring-blue-100'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {currentStep !== 'SEATS' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 'SEATS' ? 'text-[#1E3A5F]' : 'text-slate-600'
                }`}
              >
                Chọn ghế
              </span>
            </div>

            <div
              className={`flex-1 h-0.5 mx-2 transition-colors ${
                currentStep !== 'SEATS' ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />

            {/* Step 2: Điểm đón trả */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep === 'STOPS'
                    ? 'bg-[#1E3A5F] text-white ring-2 ring-blue-100'
                    : currentStep === 'PASSENGER'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {currentStep === 'PASSENGER' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 'STOPS'
                    ? 'text-[#1E3A5F]'
                    : currentStep === 'PASSENGER'
                    ? 'text-slate-600'
                    : 'text-slate-400'
                }`}
              >
                Điểm đón/trả
              </span>
            </div>

            <div
              className={`flex-1 h-0.5 mx-2 transition-colors ${
                currentStep === 'PASSENGER' ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />

            {/* Step 3: Thông tin khách */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep === 'PASSENGER'
                    ? 'bg-[#1E3A5F] text-white ring-2 ring-blue-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                3
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 'PASSENGER' ? 'text-[#1E3A5F]' : 'text-slate-400'
                }`}
              >
                Thông tin khách
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body: Đồng bộ bố cục 2 cột nhất quán trên Desktop */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1">
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            {/* CỘT TRÁI: Nội dung từng bước */}
            <div className="flex-1 min-w-0 w-full">
              {/* BƯỚC 1: SƠ ĐỒ GHẾ */}
              {currentStep === 'SEATS' && (
                <div>
                  {isLoadingSeats ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <Loader2 className="w-8 h-8 text-[#1E3A5F] animate-spin" />
                      <span className="text-sm font-medium text-slate-600">
                        Đang tải sơ đồ ghế trực tiếp từ hệ thống...
                      </span>
                    </div>
                  ) : seatLayout ? (
                    <div className="w-full flex flex-col items-center">
                      <SeatMap
                        layout={seatLayout.layoutConfig}
                        seats={seatLayout.seats}
                        selectedIds={selectedSeatIds}
                        onToggle={handleToggleSeat}
                        maxSelectable={5}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-500">
                      <p>Không thể hiển thị sơ đồ ghế cho chuyến đi này.</p>
                    </div>
                  )}
                </div>
              )}

              {/* BƯỚC 2: CHỌN ĐIỂM ĐÓN & ĐIỂM TRẢ */}
              {currentStep === 'STOPS' && (
                <div className="space-y-5">
                  {/* Điểm đón */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1E3A5F] flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 leading-none">
                          Điểm đón (Lên xe)
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Khu vực: {trip.departureStation.name}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {trip.pickupPoints.map((point: StopPointView) => {
                        const isChecked = selectedPickupId === point.id;
                        return (
                          <label
                            key={point.id}
                            className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-blue-50/60 border-[#1E3A5F] ring-1 ring-[#1E3A5F]'
                                : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="pickupPoint"
                              value={point.id}
                              checked={isChecked}
                              onChange={() => setSelectedPickupId(point.id)}
                              className="mt-0.5 text-[#1E3A5F] focus:ring-[#1E3A5F] shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {point.name}
                                </span>
                                <span className="text-[11px] font-bold text-[#1E3A5F] bg-blue-100/70 px-2 py-0.5 rounded shrink-0">
                                  {point.time}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {point.address}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Điểm trả */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 leading-none">
                          Điểm trả (Xuống xe)
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Khu vực: {trip.arrivalStation.name}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {trip.dropoffPoints.map((point: StopPointView) => {
                        const isChecked = selectedDropoffId === point.id;
                        return (
                          <label
                            key={point.id}
                            className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-emerald-50/60 border-emerald-600 ring-1 ring-emerald-600'
                                : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="dropoffPoint"
                              value={point.id}
                              checked={isChecked}
                              onChange={() => setSelectedDropoffId(point.id)}
                              className="mt-0.5 text-emerald-600 focus:ring-emerald-600 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {point.name}
                                </span>
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded shrink-0">
                                  {point.time}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {point.address}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* BƯỚC 3: NHẬP THÔNG TIN HÀNH KHÁCH */}
              {currentStep === 'PASSENGER' && (
                <div className="space-y-4">
                  {/* Banner hướng dẫn */}
                  <div className="bg-blue-50 border border-blue-200 p-3 sm:p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
                    <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                    <p className="leading-relaxed">
                      Vui lòng nhập đúng thông tin để nhận mã vé điện tử qua tin nhắn và email xác nhận.
                    </p>
                  </div>

                  {/* Card form thông tin người đi */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2.5">
                      Thông tin liên hệ nhận vé
                    </h3>

                    {/* Họ tên */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Họ và tên hành khách <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={passengerName}
                          autoComplete="name"
                          onChange={(e) => {
                            setPassengerName(e.target.value);
                            if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                          }}
                          placeholder="Ví dụ: Nguyễn Văn An"
                          className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                            formErrors.name
                              ? 'border-red-400 focus:ring-red-100'
                              : 'border-slate-300 focus:ring-blue-100 focus:border-[#1E3A5F]'
                          }`}
                        />
                      </div>
                      {formErrors.name && (
                        <p className="text-red-500 text-[11px] mt-1 font-medium">{formErrors.name}</p>
                      )}
                    </div>

                    {/* Số điện thoại */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Số điện thoại nhận vé <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={passengerPhone}
                          onChange={(e) => {
                            setPassengerPhone(e.target.value);
                            if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
                          }}
                          placeholder="Ví dụ: 0912345678"
                          className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                            formErrors.phone
                              ? 'border-red-400 focus:ring-red-100'
                              : 'border-slate-300 focus:ring-blue-100 focus:border-[#1E3A5F]'
                          }`}
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="text-red-500 text-[11px] mt-1 font-medium">{formErrors.phone}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Email nhận vé điện tử <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={passengerEmail}
                          onChange={(e) => {
                            setPassengerEmail(e.target.value);
                            if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                          }}
                          placeholder="Ví dụ: an.nguyen@example.com"
                          className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                            formErrors.email
                              ? 'border-red-400 focus:ring-red-100'
                              : 'border-slate-300 focus:ring-blue-100 focus:border-[#1E3A5F]'
                          }`}
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-red-500 text-[11px] mt-1 font-medium">{formErrors.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CỘT PHẢI: Bảng tóm tắt chuyến đi & Đặt chỗ (Cố định ở mọi bước) */}
            <div className="w-full lg:w-72 shrink-0 flex flex-col gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Tóm tắt chuyến đi</h3>
                <div className="flex items-center gap-1 text-amber-600 mb-1.5 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{trip.operator.rating} / 5</span>
                  <span className="text-slate-400">({trip.operator.reviewCount} đánh giá)</span>
                </div>
                <div className="text-slate-600 space-y-1 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{trip.departureTime} ({trip.departureDate})</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1E3A5F] shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{trip.departureStation.name}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{trip.arrivalStation.name}</span>
                  </div>
                </div>
              </div>

              {/* Danh sách ghế đã chọn */}
              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-semibold text-slate-900">Ghế đã chọn:</h4>
                  <span className="text-[11px] font-bold text-[#C2410C]">
                    {selectedSeatsList.length} ghế
                  </span>
                </div>
                {selectedSeatsList.length === 0 ? (
                  <p className="text-slate-400 italic">Chưa chọn ghế</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSeatsList.map((s) => (
                      <span
                        key={s.id}
                        className="px-2 py-0.5 rounded bg-[#C2410C] text-white font-bold text-xs shadow-2xs"
                      >
                        {s.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Điểm đón & trả đã chọn */}
              {(currentStep === 'STOPS' || currentStep === 'PASSENGER') && (
                <div className="border-t border-slate-200 pt-3 space-y-2 text-[11px]">
                  <div>
                    <span className="font-semibold text-slate-700 block">Điểm đón:</span>
                    <span className="text-slate-600 line-clamp-1">
                      {selectedPickup?.name} ({selectedPickup?.time})
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Điểm trả:</span>
                    <span className="text-slate-600 line-clamp-1">
                      {selectedDropoff?.name} ({selectedDropoff?.time})
                    </span>
                  </div>
                </div>
              )}

              {/* Chi tiết tiền */}
              <div className="border-t border-slate-200 pt-3 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Giá vé cơ bản:</span>
                  <span>{formatCurrency(trip.price)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Tổng tiền:</span>
                  <span className="text-[#C2410C] text-sm font-black">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[11px] text-slate-500">
              Tổng thanh toán ({selectedSeatsList.length} vé):
            </div>
            <div className="text-base sm:text-lg font-black text-[#C2410C]">
              {formatCurrency(totalPrice)}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {currentStep !== 'SEATS' && (
              <Button
                variant="outline"
                size="md"
                disabled={isHolding}
                onClick={() => {
                  if (currentStep === 'PASSENGER') setCurrentStep('STOPS');
                  else if (currentStep === 'STOPS') setCurrentStep('SEATS');
                }}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Quay lại
              </Button>
            )}

            <Button
              variant="primary"
              size="md"
              isLoading={isHolding}
              disabled={selectedSeatIds.length === 0 || isHolding}
              onClick={handleNextStep}
              icon={
                currentStep === 'PASSENGER' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )
              }
            >
              {currentStep === 'PASSENGER' ? 'Giữ chỗ & Thanh toán' : 'Tiếp tục'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionModal;
