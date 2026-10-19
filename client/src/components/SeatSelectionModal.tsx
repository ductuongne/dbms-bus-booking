import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  User,
  Phone,
  Mail,
  ArrowRight,
  ArrowLeft,
  Info,
} from 'lucide-react';
import type { TripCardView, BookingCheckoutView, StopPointView } from '../types';
import { getMockSeatLayoutByTripId } from '../mocks/mockData';
import { VIETQR_CONFIG } from '../constants';
import { formatCurrency } from '../utils';
import { useToast } from '../hooks/useToast';
import SeatMap from './booking/SeatMap';
import Button from './common/Button';

function generateRandomBookingCode(): string {
  return `XV-${Math.floor(10000 + Math.random() * 90000)}`;
}

function generateRandomBookingId(): string {
  return `BK-${Date.now()}`;
}

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
  const seatLayout = getMockSeatLayoutByTripId(trip.id);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<StepKey>('SEATS');
  const { warning } = useToast();

  // Điểm đón & Điểm trả
  const [selectedPickupId, setSelectedPickupId] = useState<string>(
    trip.pickupPoints[0]?.id || ''
  );
  const [selectedDropoffId, setSelectedDropoffId] = useState<string>(
    trip.dropoffPoints[0]?.id || ''
  );

  // Thông tin hành khách (khởi tạo rỗng, ERR-04)
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string; email?: string }>({});

  // Bắt phím Escape để đóng modal (ERR-19)
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

  const selectedSeatsList = seatLayout.seats.filter((s) => selectedSeatIds.includes(s.id));
  // Tổng tiền = giá vé chuyến × số ghế (B0.3, ERR-12)
  const totalPrice = trip.price * selectedSeatsList.length;

  const selectedPickup =
    trip.pickupPoints.find((p) => p.id === selectedPickupId) || trip.pickupPoints[0];
  const selectedDropoff =
    trip.dropoffPoints.find((p) => p.id === selectedDropoffId) || trip.dropoffPoints[0];

  const handleNextStep = () => {
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

      const randomBookingCode = generateRandomBookingCode();
      const checkoutPayload: BookingCheckoutView = {
        bookingId: generateRandomBookingId(),
        bookingCode: randomBookingCode,
        trip,
        selectedSeats: selectedSeatsList,
        pickupPoint: selectedPickup,
        dropoffPoint: selectedDropoff,
        passenger: {
          fullName: passengerName.trim(),
          phone: passengerPhone.trim(),
          email: passengerEmail.trim(),
        },
        totalAmount: totalPrice,
        totalOriginalAmount: totalPrice,
        discountAmount: 0,
        finalAmount: totalPrice,
        payment: {
          bankName: VIETQR_CONFIG.DEFAULT_BANK,
          bankBin: VIETQR_CONFIG.BANK_BIN,
          accountNumber: VIETQR_CONFIG.ACCOUNT_NUMBER,
          accountName: VIETQR_CONFIG.ACCOUNT_NAME,
          amount: totalPrice,
          transferContent: `XEVIET ${randomBookingCode}`,
          qrImageUrl: `https://img.vietqr.io/image/${VIETQR_CONFIG.BANK_BIN}-${VIETQR_CONFIG.ACCOUNT_NUMBER}-compact2.png?amount=${totalPrice}&addInfo=XEVIET%20${randomBookingCode}&accountName=${encodeURIComponent(
            VIETQR_CONFIG.ACCOUNT_NAME
          )}`,
          countdownSeconds: VIETQR_CONFIG.DEFAULT_COUNTDOWN_SECONDS,
        },
      };

      onProceedToCheckout(checkoutPayload);
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
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-bold text-base text-slate-900">
                {trip.operator.name} • {trip.busType.name}
              </h2>
              <p className="text-xs text-slate-500">
                {trip.departureStation.name} → {trip.arrivalStation.name} • Khởi hành {trip.departureTime}
              </p>
            </div>
          </div>

          {/* Stepper indicators */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
            <span
              className={`px-3 py-1 rounded-full ${
                currentStep === 'SEATS'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              1. Chọn chỗ
            </span>
            <span
              className={`px-3 py-1 rounded-full ${
                currentStep === 'STOPS'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              2. Đón &amp; Trả
            </span>
            <span
              className={`px-3 py-1 rounded-full ${
                currentStep === 'PASSENGER'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              3. Thông tin
            </span>
          </div>
          <button
              type="button"
              onClick={onClose}
              aria-label="Đóng bảng chọn ghế"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* BƯỚC 1: SƠ ĐỒ CHỖ NGỒI (B5) */}
          {currentStep === 'SEATS' && (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Sơ đồ ghế */}
              <div className="flex-1 w-full flex flex-col items-center">
                <SeatMap
                  layout={seatLayout.layoutConfig}
                  seats={seatLayout.seats}
                  selectedIds={selectedSeatIds}
                  onToggle={handleToggleSeat}
                  maxSelectable={5}
                />
              </div>

              {/* Tóm tắt bên phải */}
              <div className="w-full lg:w-72 flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Thông tin chuyến</h3>
                  <div className="flex items-center gap-1 text-amber-600 mb-2 font-medium">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{trip.operator.rating} / 5</span>
                    <span className="text-slate-400">({trip.operator.reviewCount} đánh giá)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {trip.operator.cancellationPolicy}
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <h4 className="font-semibold text-slate-900 mb-2">Chỗ ngồi đã chọn:</h4>
                  {selectedSeatsList.length === 0 ? (
                    <p className="text-slate-400 italic">Chưa có ghế nào được chọn (tối đa 5 ghế)</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {selectedSeatsList.map((s) => (
                        <span
                          key={s.id}
                          className="px-2.5 py-1 bg-[#1E3A5F] text-white font-semibold rounded-md text-xs"
                        >
                          Ghế {s.label}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm font-bold text-slate-900 mt-2">
                    <span>Đơn giá:</span>
                    <span>{formatCurrency(trip.price)}</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100 flex items-start gap-2 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-[#1E3A5F] shrink-0 mt-0.5" />
                  <span>Giá vé đã bao gồm bảo hiểm hành khách và nước uống trên xe.</span>
                </div>
              </div>
            </div>
          )}

          {/* BƯỚC 2: CHỌN ĐIỂM ĐÓN & TRẢ */}
          {currentStep === 'STOPS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Điểm đón */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <MapPin className="w-4 h-4 text-[#C2410C]" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Điểm đón tại {trip.departureStation.name} (ERR-08)
                  </h3>
                </div>

                <div className="flex flex-col gap-2">
                  {trip.pickupPoints.map((point: StopPointView) => (
                    <label
                      key={point.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        selectedPickupId === point.id
                          ? 'border-[#1E3A5F] bg-blue-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pickupPoint"
                        value={point.id}
                        checked={selectedPickupId === point.id}
                        onChange={() => setSelectedPickupId(point.id)}
                        className="mt-1 accent-[#1E3A5F]"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{point.name}</span>
                          <span className="text-[#C2410C] font-semibold">{point.time}</span>
                        </div>
                        <p className="text-slate-500 mt-0.5">{point.address}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Điểm trả */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Điểm trả tại {trip.arrivalStation.name} (ERR-08)
                  </h3>
                </div>

                <div className="flex flex-col gap-2">
                  {trip.dropoffPoints.map((point: StopPointView) => (
                    <label
                      key={point.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        selectedDropoffId === point.id
                          ? 'border-[#1E3A5F] bg-blue-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="dropoffPoint"
                        value={point.id}
                        checked={selectedDropoffId === point.id}
                        onChange={() => setSelectedDropoffId(point.id)}
                        className="mt-1 accent-[#1E3A5F]"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{point.name}</span>
                          <span className="text-green-700 font-semibold">{point.time}</span>
                        </div>
                        <p className="text-slate-500 mt-0.5">{point.address}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BƯỚC 3: THÔNG TIN HÀNH KHÁCH */}
          {currentStep === 'PASSENGER' && (
            <div className="max-w mx-auto flex flex-col gap-4">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-slate-700">
                <Info className="w-4 h-4 text-[#1E3A5F] shrink-0 mt-0.5" />
                <span>
                  Thông tin vé điện tử và mã QR thanh toán VietQR sẽ được gửi về số điện thoại và email này.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Họ và tên hành khách</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={passengerName}
                    onChange={(e) => {
                      setPassengerName(e.target.value);
                      if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] ${
                      formErrors.name ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                </div>
                {formErrors.name && (
                  <span className="text-xs text-red-600 font-medium">{formErrors.name}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Số điện thoại liên hệ</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={passengerPhone}
                    onChange={(e) => {
                      setPassengerPhone(e.target.value);
                      if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="Ví dụ: 0988000111"
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] ${
                      formErrors.phone ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                </div>
                {formErrors.phone && (
                  <span className="text-xs text-red-600 font-medium">{formErrors.phone}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Email nhận vé điện tử</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={passengerEmail}
                    onChange={(e) => {
                      setPassengerEmail(e.target.value);
                      if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="Ví dụ: nva@example.com"
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] ${
                      formErrors.email ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                </div>
                {formErrors.email && (
                  <span className="text-xs text-red-600 font-medium">{formErrors.email}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <div className="text-xs text-slate-500">
              Tổng tiền ({selectedSeatsList.length} vé):
            </div>
            <div className="text-lg font-black text-[#C2410C]">
              {formatCurrency(totalPrice)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentStep !== 'SEATS' && (
              <Button
                variant="outline"
                size="md"
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
              disabled={selectedSeatIds.length === 0}
              onClick={handleNextStep}
              icon={currentStep === 'PASSENGER' ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            >
              {currentStep === 'PASSENGER' ? 'Thanh toán' : 'Tiếp tục'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionModal;
