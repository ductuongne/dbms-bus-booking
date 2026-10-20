import React from 'react';
import { Ticket, Search, Calendar } from 'lucide-react';
import { useBookingManagement } from './bookings/hooks/useBookingManagement';
import { QuickCheckInBar } from './bookings/components/QuickCheckInBar';
import { BookingLookupSection } from './bookings/components/BookingLookupSection';
import { TripManifestSection } from './bookings/components/TripManifestSection';

export const AdminBookingsPage: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    bookingCodeInput,
    setBookingCodeInput,
    lookupResult,
    isSearchingCode,
    handleLookupBooking,
    ticketCodeInput,
    setTicketCodeInput,
    isCheckingIn,
    handleCheckIn,
    trips,
    selectedTripId,
    setSelectedTripId,
    tripTickets,
    loadingTickets,
    refreshTickets,
  } = useBookingManagement();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-[#1E3A5F]" />
            Quản lý Đặt vé &amp; Check-in
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tra cứu đơn đặt vé, danh sách hành khách theo chuyến và xác nhận check-in lên xe
          </p>
        </div>
      </div>

      {/* Quick Check-in Bar */}
      <QuickCheckInBar
        ticketCode={ticketCodeInput}
        onTicketCodeChange={setTicketCodeInput}
        onSubmit={handleCheckIn}
        isLoading={isCheckingIn}
      />

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('lookup')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
            activeTab === 'lookup'
              ? 'border-[#1E3A5F] text-[#1E3A5F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Tra cứu Đơn đặt vé</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trip_manifest')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
            activeTab === 'trip_manifest'
              ? 'border-[#1E3A5F] text-[#1E3A5F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Danh sách Vé theo Chuyến xe</span>
        </button>
      </div>

      {/* TAB 1: TRA CỨU ĐƠN ĐẶT VÉ */}
      {activeTab === 'lookup' && (
        <BookingLookupSection
          bookingCodeInput={bookingCodeInput}
          onBookingCodeChange={setBookingCodeInput}
          onSearch={handleLookupBooking}
          isSearching={isSearchingCode}
          lookupResult={lookupResult}
          onCheckIn={handleCheckIn}
        />
      )}

      {/* TAB 2: DANH SÁCH VÉ THEO CHUYẾN XE */}
      {activeTab === 'trip_manifest' && (
        <TripManifestSection
          trips={trips}
          selectedTripId={selectedTripId}
          onSelectedTripIdChange={setSelectedTripId}
          tripTickets={tripTickets}
          loadingTickets={loadingTickets}
          onRefreshTickets={refreshTickets}
          onCheckIn={handleCheckIn}
        />
      )}
    </div>
  );
};

export default AdminBookingsPage;
