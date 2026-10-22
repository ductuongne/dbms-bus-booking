import { useState, useEffect, useCallback } from 'react';
import {
  bookingService,
  type BookingLookupResponse,
  type StaffTicketItem,
} from '../../../../services/booking.service';
import { tripService, type AdminTripItem } from '../../../../services/trip.service';
import { useToast } from '../../../../hooks/useToast';

export function useBookingManagement() {
  const { success, error: toastError, info } = useToast();

  const [activeTab, setActiveTab] = useState<'lookup' | 'trip_manifest'>('lookup');

  // Search by Booking Code or Phone
  const [searchMode, setSearchMode] = useState<'code' | 'phone'>('code');
  const [bookingCodeInput, setBookingCodeInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [lookupResults, setLookupResults] = useState<BookingLookupResponse[]>([]);
  const [selectedBookingCode, setSelectedBookingCode] = useState<string>('');
  const [isSearchingCode, setIsSearchingCode] = useState(false);

  // Quick Check-in by Ticket Code
  const [ticketCodeInput, setTicketCodeInput] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Trip Manifest View
  const [trips, setTrips] = useState<AdminTripItem[]>([]);
  const [tripDate, setTripDate] = useState<string>('');
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [tripTickets, setTripTickets] = useState<StaffTicketItem[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Load Trips based on selected date or mount
  useEffect(() => {
    let ignore = false;
    async function loadTrips() {
      setLoadingTrips(true);
      try {
        const res = await tripService.getAdminTrips({
          date: tripDate || undefined,
          limit: 100,
        });
        if (!ignore) {
          const list = res.data || [];
          setTrips(list);
          setSelectedTripId((prev) => {
            const exists = list.some((t) => t.trip_id === prev);
            return exists ? prev : (list[0]?.trip_id || '');
          });
        }
      } catch (err: unknown) {
        console.error('Không thể tải danh sách chuyến:', err);
        if (!ignore) {
          setTrips([]);
          setSelectedTripId('');
        }
      } finally {
        if (!ignore) {
          setLoadingTrips(false);
        }
      }
    }
    void loadTrips();
    return () => {
      ignore = true;
    };
  }, [tripDate, reloadKey]);

  // Load Trip Tickets when tab is active or selectedTripId/reloadKey changes
  useEffect(() => {
    if (activeTab !== 'trip_manifest' || !selectedTripId) return;
    let ignore = false;

    async function fetchTickets() {
      setLoadingTickets(true);
      try {
        const tickets = await bookingService.getTripTickets(selectedTripId);
        if (!ignore) {
          setTripTickets(tickets || []);
        }
      } catch (err: unknown) {
        if (!ignore) {
          toastError(err instanceof Error ? err.message : 'Không thể tải danh sách vé của chuyến');
          setTripTickets([]);
        }
      } finally {
        if (!ignore) {
          setLoadingTickets(false);
        }
      }
    }

    void fetchTickets();
    return () => {
      ignore = true;
    };
  }, [activeTab, selectedTripId, reloadKey, toastError]);

  const handleLookupBooking = useCallback(
    async (codeToLookup?: string, phoneToLookup?: string) => {
      const mode = searchMode;

      if (mode === 'code' || codeToLookup) {
        const code = (codeToLookup || bookingCodeInput).trim();
        if (!code) {
          toastError('Vui lòng nhập mã đặt vé (Booking Code)');
          return;
        }

        setIsSearchingCode(true);
        try {
          const res = await bookingService.getBookingByCode(code);
          setLookupResults([res]);
          setSelectedBookingCode(res.booking.booking_code);
          success(`Tìm thấy đơn đặt vé ${res.booking.booking_code}`);
        } catch (err: unknown) {
          toastError(err instanceof Error ? err.message : 'Không tìm thấy thông tin đơn đặt vé');
          setLookupResults([]);
          setSelectedBookingCode('');
        } finally {
          setIsSearchingCode(false);
        }
      } else {
        const phone = (phoneToLookup || phoneInput).trim();
        if (!phone) {
          toastError('Vui lòng nhập số điện thoại');
          return;
        }

        setIsSearchingCode(true);
        try {
          const resList = await bookingService.getBookingsByPhone(phone);
          if (resList.length === 0) {
            info(`Không tìm thấy đơn đặt vé nào với số điện thoại ${phone}`);
            setLookupResults([]);
            setSelectedBookingCode('');
          } else {
            setLookupResults(resList);
            setSelectedBookingCode(resList[0].booking.booking_code);
            success(`Tìm thấy ${resList.length} đơn đặt vé cho SĐT ${phone}`);
          }
        } catch (err: unknown) {
          toastError(err instanceof Error ? err.message : 'Lỗi khi tra cứu theo số điện thoại');
          setLookupResults([]);
          setSelectedBookingCode('');
        } finally {
          setIsSearchingCode(false);
        }
      }
    },
    [searchMode, bookingCodeInput, phoneInput, success, toastError, info]
  );

  const handleCheckIn = useCallback(
    async (ticketCode: string) => {
      const cleanCode = ticketCode.trim();
      if (!cleanCode) return;
      setIsCheckingIn(true);
      try {
        const res = await bookingService.checkInTicket(cleanCode);
        success(`Check-in thành công: Hành khách ${res.passenger_name} (Ghế ${res.ticket_code})`);

        // Refresh currently active lookup
        if (searchMode === 'code' && bookingCodeInput) {
          void handleLookupBooking(bookingCodeInput);
        } else if (searchMode === 'phone' && phoneInput) {
          void handleLookupBooking(undefined, phoneInput);
        } else if (lookupResults.length > 0) {
          void handleLookupBooking(selectedBookingCode || lookupResults[0].booking.booking_code);
        }

        // Trigger manifest refresh
        setReloadKey((prev) => prev + 1);
        setTicketCodeInput('');
      } catch (err: unknown) {
        toastError(err instanceof Error ? err.message : 'Check-in vé thất bại');
      } finally {
        setIsCheckingIn(false);
      }
    },
    [handleLookupBooking, searchMode, bookingCodeInput, phoneInput, lookupResults, selectedBookingCode, success, toastError]
  );

  const activeLookupResult =
    lookupResults.find((r) => r.booking.booking_code === selectedBookingCode) ||
    lookupResults[0] ||
    null;

  return {
    activeTab,
    setActiveTab,
    searchMode,
    setSearchMode,
    bookingCodeInput,
    setBookingCodeInput,
    phoneInput,
    setPhoneInput,
    lookupResults,
    lookupResult: activeLookupResult,
    selectedBookingCode,
    setSelectedBookingCode,
    isSearchingCode,
    handleLookupBooking,
    ticketCodeInput,
    setTicketCodeInput,
    isCheckingIn,
    handleCheckIn,
    trips,
    tripDate,
    setTripDate,
    loadingTrips,
    selectedTripId,
    setSelectedTripId,
    tripTickets: selectedTripId ? tripTickets : [],
    loadingTickets,
    refreshTickets: () => setReloadKey((prev) => prev + 1),
  };
}

export default useBookingManagement;
