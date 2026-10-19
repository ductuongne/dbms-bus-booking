import { useState, useEffect, useCallback } from 'react';
import {
  bookingService,
  type BookingLookupResponse,
  type StaffTicketItem,
} from '../../../../services/booking.service';
import { tripService, type AdminTripItem } from '../../../../services/trip.service';
import { useToast } from '../../../../hooks/useToast';

export function useBookingManagement() {
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'lookup' | 'trip_manifest'>('lookup');

  // Search by Booking Code
  const [bookingCodeInput, setBookingCodeInput] = useState('');
  const [lookupResult, setLookupResult] = useState<BookingLookupResponse | null>(null);
  const [isSearchingCode, setIsSearchingCode] = useState(false);

  // Quick Check-in by Ticket Code
  const [ticketCodeInput, setTicketCodeInput] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Trip Manifest View
  const [trips, setTrips] = useState<AdminTripItem[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [tripTickets, setTripTickets] = useState<StaffTicketItem[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Load Trips once on mount
  useEffect(() => {
    let ignore = false;
    async function loadTrips() {
      try {
        const res = await tripService.getAdminTrips({ limit: 50 });
        if (!ignore && res.data && res.data.length > 0) {
          setTrips(res.data);
          setSelectedTripId((prev) => prev || res.data[0].trip_id);
        }
      } catch (err: unknown) {
        console.error('Không thể tải danh sách chuyến:', err);
      }
    }
    void loadTrips();
    return () => {
      ignore = true;
    };
  }, []);

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
    async (codeToLookup?: string) => {
      const code = (codeToLookup || bookingCodeInput).trim();
      if (!code) return;

      setIsSearchingCode(true);
      try {
        const res = await bookingService.getBookingByCode(code);
        setLookupResult(res);
      } catch (err: unknown) {
        toastError(err instanceof Error ? err.message : 'Không tìm thấy thông tin đơn đặt vé');
        setLookupResult(null);
      } finally {
        setIsSearchingCode(false);
      }
    },
    [bookingCodeInput, toastError]
  );

  const handleCheckIn = useCallback(
    async (ticketCode: string) => {
      const cleanCode = ticketCode.trim();
      if (!cleanCode) return;
      setIsCheckingIn(true);
      try {
        const res = await bookingService.checkInTicket(cleanCode);
        success(`Check-in thành công: Hành khách ${res.passenger_name} (Ghế ${res.ticket_code})`);

        // Refresh currently active views
        if (lookupResult) {
          void handleLookupBooking(lookupResult.booking.booking_code);
        }
        setReloadKey((prev) => prev + 1);
        setTicketCodeInput('');
      } catch (err: unknown) {
        toastError(err instanceof Error ? err.message : 'Check-in vé thất bại');
      } finally {
        setIsCheckingIn(false);
      }
    },
    [handleLookupBooking, lookupResult, success, toastError]
  );

  return {
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
    refreshTickets: () => setReloadKey((prev) => prev + 1),
  };
}

export default useBookingManagement;
