import React, { useState } from 'react';
import {
  X,
  Star,
  Home,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  User,
  Phone,
  Mail,
  ArrowRight,
} from 'lucide-react';
import type { TripCardView, SeatItemView, BookingCheckoutView, StopPointView } from '../types';
import { getMockSeatLayoutByTripId } from '../mocks/mockData';
import { VIETQR_CONFIG } from '../constants';

function generateRandomBookingCode(): string {
  return `RB-${Math.floor(10000 + Math.random() * 90000)}`;
}

function generateRandomBookingId(): string {
  return `BK-${Date.now()}`;
}

interface SeatSelectionModalProps {
  trip: TripCardView;
  onClose: () => void;
  onProceedToCheckout: (checkoutData: BookingCheckoutView) => void;
}

type TabKey = 'why' | 'pickup' | 'dropoff' | 'amenities' | 'reviews';
type StepKey = 'SEATS' | 'STOPS' | 'PASSENGER';

export const SeatSelectionModal: React.FC<SeatSelectionModalProps> = ({
  trip,
  onClose,
  onProceedToCheckout,
}) => {
  const seatLayout = getMockSeatLayoutByTripId(trip.id);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>(['BUS-02-S15']);
  const [currentStep, setCurrentStep] = useState<StepKey>('SEATS');
  const [activeTab, setActiveTab] = useState<TabKey>('why');

  // Selected pickup & dropoff point
  const [selectedPickupId, setSelectedPickupId] = useState<string>(
    trip.pickupPoints[0]?.id || ''
  );
  const [selectedDropoffId, setSelectedDropoffId] = useState<string>(
    trip.dropoffPoints[0]?.id || ''
  );

  // Passenger form info (matches screenshot image_af37df.png: ádfs, dfsdfs@gmail.com, 84328749584)
  const [passengerName, setPassengerName] = useState('ádfs');
  const [passengerPhone, setPassengerPhone] = useState('84328749584');
  const [passengerEmail, setPassengerEmail] = useState('dfsdfs@gmail.com');
  const [formError, setFormError] = useState<string | null>(null);

  const toggleSeat = (seat: SeatItemView) => {
    if (seat.status === 'BOOKED') return;

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seat.id));
    } else {
      setSelectedSeatIds([...selectedSeatIds, seat.id]);
    }
  };

  const selectedSeatsList = seatLayout.seats.filter((s) => selectedSeatIds.includes(s.id));
  const originalTotalPrice = selectedSeatsList.reduce((sum, s) => sum + s.price, 0);
  const discountAmount = selectedSeatsList.length > 0 ? 5000 : 0; // Áp dụng deal 5.000đ như hình
  const finalTotalPrice = Math.max(0, originalTotalPrice - discountAmount);

  const selectedPickup =
    trip.pickupPoints.find((p) => p.id === selectedPickupId) || trip.pickupPoints[0];
  const selectedDropoff =
    trip.dropoffPoints.find((p) => p.id === selectedDropoffId) || trip.dropoffPoints[0];

  const handleNextStep = () => {
    if (currentStep === 'SEATS') {
      if (selectedSeatIds.length === 0) {
        alert('Vui lòng chọn ít nhất một ghế ngồi để tiếp tục.');
        return;
      }
      setCurrentStep('STOPS');
    } else if (currentStep === 'STOPS') {
      setCurrentStep('PASSENGER');
    } else if (currentStep === 'PASSENGER') {
      if (!passengerName.trim() || !passengerPhone.trim() || !passengerEmail.trim()) {
        setFormError('Vui lòng điền đầy đủ họ tên, số điện thoại và email nhận vé.');
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
          fullName: passengerName,
          phone: passengerPhone,
          email: passengerEmail,
        },
        totalOriginalAmount: originalTotalPrice,
        discountAmount,
        finalAmount: finalTotalPrice,
        payment: {
          bankName: VIETQR_CONFIG.DEFAULT_BANK,
          bankBin: VIETQR_CONFIG.BANK_BIN,
          accountNumber: VIETQR_CONFIG.ACCOUNT_NUMBER,
          accountName: VIETQR_CONFIG.ACCOUNT_NAME,
          amount: finalTotalPrice,
          transferContent: `REDBUS ${randomBookingCode}`,
          qrImageUrl: `https://img.vietqr.io/image/${VIETQR_CONFIG.BANK_BIN}-${VIETQR_CONFIG.ACCOUNT_NUMBER}-compact2.png?amount=${finalTotalPrice}&addInfo=REDBUS%20${randomBookingCode}&accountName=${encodeURIComponent(
            VIETQR_CONFIG.ACCOUNT_NAME
          )}`,
          countdownSeconds: VIETQR_CONFIG.DEFAULT_COUNTDOWN_SECONDS,
        },
      };

      onProceedToCheckout(checkoutPayload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              aria-label="Đóng bảng chọn ghế"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                <span>{trip.departureStation.name}</span>
                <span className="text-gray-400">→</span>
                <span>{trip.arrivalStation.name}</span>
              </h3>
              <p className="text-xs text-gray-500">
                {trip.operator.name} • {trip.busType.name} ({trip.departureTime} - {trip.arrivalTime})
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-xs text-gray-400">Giá vé</span>
            <p className="text-lg font-bold text-[#FF385C]">
              {trip.price.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>

        {/* Step Navigation Tabs (image_af33a7.jpg) */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 text-xs sm:text-sm font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setCurrentStep('SEATS')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-all cursor-pointer ${
              currentStep === 'SEATS'
                ? 'border-[#FF385C] text-[#FF385C] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            1. Chọn chỗ ngồi
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedSeatIds.length > 0) setCurrentStep('STOPS');
            }}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-all cursor-pointer ${
              currentStep === 'STOPS'
                ? 'border-[#FF385C] text-[#FF385C] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            2. Chọn điểm đón và điểm trả
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedSeatIds.length > 0) setCurrentStep('PASSENGER');
            }}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-all cursor-pointer ${
              currentStep === 'PASSENGER'
                ? 'border-[#FF385C] text-[#FF385C] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            3. Điền thông tin hành khách
          </button>
        </div>

        {/* Main Split Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left Column: Visual Bus Seat Map Layout (image_af33a7.jpg) */}
          <div className="lg:col-span-5 p-6 bg-gray-50/50 border-r border-gray-100 flex flex-col items-center justify-between">
            {/* Bus Cabin Frame */}
            <div className="w-full max-w-[280px] bg-white rounded-3xl p-5 shadow-sm border-2 border-gray-200/80 relative">
              {/* Bus Front Driver Steering Wheel */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500" title="Vị trí tài xế">
                  {/* Steering wheel icon */}
                  <div className="w-6 h-6 rounded-full border-2 border-gray-500 flex items-center justify-center relative">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Cửa lên xe
                </span>
              </div>

              {/* Seats Grid */}
              <div className="space-y-3">
                {/* Row 1 */}
                <div className="grid grid-cols-3 gap-2 justify-items-center">
                  <div className="w-10 h-12" /> {/* Empty space behind driver */}
                  {seatLayout.seats.slice(0, 2).map((seat) => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedSeatIds.includes(seat.id)}
                      onToggle={toggleSeat}
                    />
                  ))}
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-3 gap-2 justify-items-center">
                  {seatLayout.seats.slice(2, 3).map((seat) => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedSeatIds.includes(seat.id)}
                      onToggle={toggleSeat}
                    />
                  ))}
                  {seatLayout.seats.slice(3, 5).map((seat) => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedSeatIds.includes(seat.id)}
                      onToggle={toggleSeat}
                    />
                  ))}
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-3 gap-2 justify-items-center">
                  <div className="w-10 h-12" /> {/* Aisle */}
                  {seatLayout.seats.slice(5, 7).map((seat) => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedSeatIds.includes(seat.id)}
                      onToggle={toggleSeat}
                    />
                  ))}
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-3 gap-2 justify-items-center">
                  {seatLayout.seats.slice(7, 8).map((seat) => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedSeatIds.includes(seat.id)}
                      onToggle={toggleSeat}
                    />
                  ))}
                  {seatLayout.seats.slice(8, 10).map((seat) => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedSeatIds.includes(seat.id)}
                      onToggle={toggleSeat}
                    />
                  ))}
                </div>

                {/* Row 5: Back row */}
                <div className="grid grid-cols-4 gap-1.5 justify-items-center pt-2 border-t border-gray-100">
                  {seatLayout.seats.slice(10, 14).map((seat) => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedSeatIds.includes(seat.id)}
                      onToggle={toggleSeat}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Seat Legend (image_af33a7.jpg: Loại ghế của bạn - Có sẵn, Đã đặt) */}
            <div className="w-full max-w-[280px] mt-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
              <h5 className="text-xs font-bold text-gray-800 mb-3 uppercase tracking-wider">
                Loại ghế của bạn
              </h5>
              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Có sẵn</span>
                  <div className="w-7 h-9 rounded-lg border-2 border-emerald-500 bg-white flex items-center justify-center" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Đã đặt</span>
                  <div className="w-7 h-9 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-400 font-bold text-xs">
                    ✕
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Đang chọn</span>
                  <div className="w-7 h-9 rounded-lg bg-[#FF385C] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    ✓
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tab Information / Stops / Passenger Form */}
          <div className="lg:col-span-7 p-6 flex flex-col justify-between overflow-y-auto">
            {/* Step 1: Seat Info & Operator Detail Tabs (image_af33a7.jpg) */}
            {currentStep === 'SEATS' && (
              <div className="space-y-5">
                {/* Operator Header Card */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-gray-900">{trip.operator.name}</h4>
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-xs">
                        <Star className="w-3 h-3 fill-white" />
                        {trip.operator.rating}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {trip.departureTime} - {trip.arrivalTime} • {trip.departureDate} • {trip.busType.name}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-rose-50 text-[#FF385C] font-semibold text-xs rounded-full border border-rose-100">
                    Xe VIP Limousine
                  </span>
                </div>

                {/* Photos Gallery */}
                <div className="grid grid-cols-3 gap-2">
                  {trip.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${trip.operator.name} thumbnail ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-xl border border-gray-100"
                    />
                  ))}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 text-xs font-semibold gap-4 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('why')}
                    className={`pb-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                      activeTab === 'why'
                        ? 'border-[#FF385C] text-[#FF385C]'
                        : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Tại sao nên đặt xe này?
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pickup')}
                    className={`pb-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                      activeTab === 'pickup'
                        ? 'border-[#FF385C] text-[#FF385C]'
                        : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Điểm đón
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dropoff')}
                    className={`pb-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                      activeTab === 'dropoff'
                        ? 'border-[#FF385C] text-[#FF385C]'
                        : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Điểm trả
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('amenities')}
                    className={`pb-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                      activeTab === 'amenities'
                        ? 'border-[#FF385C] text-[#FF385C]'
                        : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Tiện nghi
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="text-xs text-gray-700 min-h-[140px]">
                  {activeTab === 'why' && (
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                        <Home className="w-5 h-5 text-gray-600" />
                        <div>
                          <strong>Trả tận nhà</strong>
                          <p className="text-gray-500 text-[11px]">Hỗ trợ trả khách tận nơi tại trung tâm thành phố Ninh Bình</p>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <div>
                          <strong>Chính sách hủy linh hoạt</strong>
                          <p className="text-gray-500 text-[11px]">{trip.operator.cancellationPolicy}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'pickup' && (
                    <div className="space-y-2">
                      {trip.pickupPoints.map((p) => (
                        <div key={p.id} className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-gray-900">{p.time}</span> • {p.name}
                            <p className="text-gray-400 text-[11px]">{p.address}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'dropoff' && (
                    <div className="space-y-2">
                      {trip.dropoffPoints.map((p) => (
                        <div key={p.id} className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-gray-900">{p.time}</span> • {p.name}
                            <p className="text-gray-400 text-[11px]">{p.address}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'amenities' && (
                    <div className="grid grid-cols-2 gap-2">
                      {trip.operator.amenities.map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-gray-50 rounded-xl flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Choose Pickup & Dropoff Radio list */}
            {currentStep === 'STOPS' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#FF385C]" />
                    <span>Chọn điểm đón tại Hà Nội</span>
                  </h4>
                  <div className="space-y-2">
                    {trip.pickupPoints.map((point: StopPointView) => (
                      <label
                        key={point.id}
                        className={`block p-3 rounded-2xl border transition-all cursor-pointer ${
                          selectedPickupId === point.id
                            ? 'border-[#FF385C] bg-rose-50/50 shadow-xs'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="pickup-radio"
                            value={point.id}
                            checked={selectedPickupId === point.id}
                            onChange={() => setSelectedPickupId(point.id)}
                            className="text-[#FF385C] focus:ring-[#FF385C] w-4 h-4"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-gray-900">{point.name}</span>
                              <span className="text-xs font-semibold text-[#FF385C]">{point.time}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">{point.address}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Chọn điểm trả tại Ninh Bình</span>
                  </h4>
                  <div className="space-y-2">
                    {trip.dropoffPoints.map((point: StopPointView) => (
                      <label
                        key={point.id}
                        className={`block p-3 rounded-2xl border transition-all cursor-pointer ${
                          selectedDropoffId === point.id
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="dropoff-radio"
                            value={point.id}
                            checked={selectedDropoffId === point.id}
                            onChange={() => setSelectedDropoffId(point.id)}
                            className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-gray-900">{point.name}</span>
                              <span className="text-xs font-semibold text-emerald-600">{point.time}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">{point.address}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Passenger Form Info */}
            {currentStep === 'PASSENGER' && (
              <div className="space-y-4">
                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100 text-xs text-rose-900">
                  <strong>Lưu ý:</strong> Thông tin vé điện tử và mã QR lên xe sẽ được gửi qua SMS và Email dưới đây.
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
                    {formError}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Họ và tên hành khách
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Văn A"
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#FF385C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value)}
                        placeholder="Ví dụ: 0988000111"
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#FF385C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Email nhận vé điện tử
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        placeholder="Ví dụ: customer@example.com"
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#FF385C]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Chuyến xe:</span>
                      <span className="font-semibold">{trip.operator.name} ({trip.departureTime})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ghế đã chọn:</span>
                      <span className="font-bold text-[#FF385C]">
                        {selectedSeatsList.map((s) => s.seatNumber).join(', ') || 'Chưa chọn'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Điểm đón:</span>
                      <span className="font-medium text-right max-w-[240px] truncate">{selectedPickup.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Điểm trả:</span>
                      <span className="font-medium text-right max-w-[240px] truncate">{selectedDropoff.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="pt-5 border-t border-gray-100 flex items-center justify-between gap-4 mt-6">
              <div>
                <span className="text-[11px] text-gray-400">
                  Đã chọn {selectedSeatIds.length} ghế
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-gray-900">
                    {finalTotalPrice.toLocaleString('vi-VN')}đ
                  </span>
                  {discountAmount > 0 && (
                    <span className="text-xs text-gray-400 line-through">
                      {originalTotalPrice.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentStep !== 'SEATS' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentStep === 'PASSENGER') setCurrentStep('STOPS');
                      else if (currentStep === 'STOPS') setCurrentStep('SEATS');
                    }}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Quay lại
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={selectedSeatIds.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{currentStep === 'PASSENGER' ? 'Tiến hành thanh toán' : 'Tiếp tục'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SeatButtonProps {
  seat: SeatItemView;
  isSelected: boolean;
  onToggle: (seat: SeatItemView) => void;
}

const SeatButton: React.FC<SeatButtonProps> = ({ seat, isSelected, onToggle }) => {
  const isBooked = seat.status === 'BOOKED';

  return (
    <button
      type="button"
      disabled={isBooked}
      onClick={() => onToggle(seat)}
      title={`Ghế ${seat.seatNumber} - ${seat.price.toLocaleString('vi-VN')}đ`}
      className={`w-10 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all cursor-pointer relative ${
        isBooked
          ? 'bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed'
          : isSelected
          ? 'bg-[#FF385C] text-white shadow-md shadow-rose-500/30 scale-105 border border-[#FF385C]'
          : 'bg-white text-emerald-700 border-2 border-emerald-500 hover:bg-emerald-50'
      }`}
    >
      <span>{isBooked ? '✕' : seat.seatNumber}</span>
    </button>
  );
};

export default SeatSelectionModal;
