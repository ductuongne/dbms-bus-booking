import React, { useState } from 'react';
import { Search, Printer, Eye, Trash2, Ticket as TicketIcon, Plus, CheckCircle2, CheckCircle, QrCode } from 'lucide-react';
import type { Booking, TableColumn, Ticket } from '../types';
import { mockBookings, mockUsers, mockRoutes, mockStations, mockTickets, mockTrips } from '../mocks/mockData';
import { formatCurrency } from '../utils';
import { useCrudState } from '../hooks/useCrudState';
import { useToast } from '../hooks/useToast';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Badge from '../components/common/Badge';

export const BookingPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);

  // Modal Check-in
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [checkinSearchCode, setCheckinSearchCode] = useState('');

  const {
    paginatedData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    isCreateModalOpen,
    setIsCreateModalOpen,
    deletingItem,
    setDeletingItem,
    addItem,
    deleteItem,
  } = useCrudState<Booking>({
    initialData: mockBookings,
    searchFilter: (b, q) =>
      b.bookingCode.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      (mockUsers.find((u) => u.id === b.customerId)?.fullName.toLowerCase().includes(q) ?? false) ||
      (mockUsers.find((u) => u.id === b.customerId)?.phone.includes(q) ?? false),
    pageSize: 10,
  });

  // Form State Tạo vé mới
  const defaultTrip = mockTrips[0];
  const [createForm, setCreateForm] = useState({
    passengerName: '',
    passengerPhone: '',
    tripId: defaultTrip?.id || '',
    seatNumber: '01',
    paymentMethod: 'CASH',
    paymentStatus: 'CONFIRMED' as 'CONFIRMED' | 'PENDING',
    price: defaultTrip?.price || 180000,
  });

  const getCustomer = (customerId: string) => {
    return mockUsers.find((u) => u.id === customerId);
  };

  const getBookingSeats = (bookingId: string) => {
    const bTickets = tickets.filter((t) => t.bookingId === bookingId);
    if (bTickets.length > 0) {
      return bTickets.map((t) => t.seatId.split('-').pop()).join(', ');
    }
    return '01, 02';
  };

  const isBookingCheckedIn = (bookingId: string) => {
    return tickets.some((t) => t.bookingId === bookingId && t.status === 'CHECKED_IN');
  };

  const getBookingRoute = () => {
    const route = mockRoutes[0];
    const dep = mockStations.find((s) => s.id === route?.departureStationId)?.name || 'Hà Nội';
    const arr = mockStations.find((s) => s.id === route?.arrivalStationId)?.name || 'Ninh Bình';
    return `${dep} → ${arr}`;
  };

  const handleDelete = () => {
    if (deletingItem) {
      deleteItem('id', deletingItem.id);
      success(`Đã hủy đơn đặt vé ${deletingItem.bookingCode}!`);
    }
  };

  const handlePrint = (booking: Booking) => {
    setViewingBooking(booking);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Check-in nhanh trên từng dòng
  const handleQuickCheckin = (booking: Booking) => {
    setTickets((prev) =>
      prev.map((t) => (t.bookingId === booking.id ? { ...t, status: 'CHECKED_IN' as const } : t))
    );
    success(`Check-in vé thành công cho đơn #${booking.bookingCode}!`);
  };

  // Tìm kiếm & xác nhận checkin trong modal
  const matchedBookingForCheckin = checkinSearchCode.trim()
    ? paginatedData.find(
        (b) =>
          b.bookingCode.toLowerCase() === checkinSearchCode.trim().toLowerCase() ||
          b.id.toLowerCase() === checkinSearchCode.trim().toLowerCase() ||
          tickets.some(
            (t) =>
              t.bookingId === b.id &&
              t.ticketCode.toLowerCase() === checkinSearchCode.trim().toLowerCase()
          )
      )
    : null;

  const handleConfirmModalCheckin = () => {
    if (!matchedBookingForCheckin) {
      toastError('Không tìm thấy thông tin vé phù hợp để check-in.');
      return;
    }
    handleQuickCheckin(matchedBookingForCheckin);
    setCheckinSearchCode('');
    setIsCheckinModalOpen(false);
  };

  // Xử lý submit Tạo vé mới
  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.passengerName.trim()) {
      toastError('Vui lòng nhập tên hành khách.');
      return;
    }
    if (!createForm.passengerPhone.trim()) {
      toastError('Vui lòng nhập số điện thoại.');
      return;
    }

    const newBookingId = `BK-${Date.now().toString().slice(-4)}`;
    const newBookingCode = `XV-${Math.floor(10000 + Math.random() * 90000)}`;

    const newBooking: Booking = {
      id: newBookingId,
      bookingCode: newBookingCode,
      customerId: `USR-WALK-${Date.now().toString().slice(-4)}`,
      channel: 'COUNTER',
      createdAt: new Date().toISOString(),
      expiredAt: new Date(Date.now() + 30 * 60000).toISOString(),
      totalAmount: createForm.price,
      status: createForm.paymentStatus,
    };

    const newTicket: Ticket = {
      id: `TCK-${Date.now().toString().slice(-4)}`,
      ticketCode: `TCK-${newBookingCode.slice(3)}-01`,
      bookingId: newBookingId,
      tripId: createForm.tripId,
      seatId: `BUS-01-${createForm.seatNumber}`,
      passengerName: createForm.passengerName.trim(),
      passengerPhone: createForm.passengerPhone.trim(),
      price: createForm.price,
      status: 'BOOKED',
    };

    // Tạo giả lập user khách vãng lai nếu cần
    mockUsers.push({
      id: newBooking.customerId,
      fullName: createForm.passengerName.trim(),
      email: `${createForm.passengerPhone.trim()}@khach.xeviet.vn`,
      phone: createForm.passengerPhone.trim(),
      role: 'CUSTOMER',
      loyaltyPoints: 0,
      isActive: true,
    });

    addItem(newBooking);
    setTickets((prev) => [newTicket, ...prev]);
    setIsCreateModalOpen(false);

    // Reset form
    setCreateForm({
      passengerName: '',
      passengerPhone: '',
      tripId: defaultTrip?.id || '',
      seatNumber: '01',
      paymentMethod: 'CASH',
      paymentStatus: 'CONFIRMED',
      price: defaultTrip?.price || 180000,
    });

    success(`Đã tạo vé thành công! Mã đơn: #${newBookingCode}`);
  };

  const columns: TableColumn<Booking>[] = [
    {
      key: 'bookingCode',
      title: 'Mã đơn vé',
      render: (b) => <span className="font-bold text-slate-900">{b.bookingCode}</span>,
    },
    {
      key: 'customerId',
      title: 'Hành khách',
      render: (b) => {
        const c = getCustomer(b.customerId);
        return (
          <div>
            <span className="font-bold text-slate-900 block">{c?.fullName || 'Khách vãng lai'}</span>
            <span className="text-slate-500 text-[11px]">{c?.phone}</span>
          </div>
        );
      },
    },
    {
      key: 'route',
      title: 'Tuyến đường',
      render: () => <span className="font-semibold text-slate-800">{getBookingRoute()}</span>,
    },
    {
      key: 'seats',
      title: 'Ghế ngồi',
      render: (b) => (
        <Badge variant="brand" size="sm">
          Ghế {getBookingSeats(b.id)}
        </Badge>
      ),
    },
    {
      key: 'totalAmount',
      title: 'Tổng tiền',
      render: (b) => (
        <span className="font-black text-[#C2410C]">{formatCurrency(b.totalAmount)}</span>
      ),
    },
    {
      key: 'status',
      title: 'Thanh toán',
      render: (b) => {
        const variants: Record<string, 'success' | 'warning' | 'danger'> = {
          CONFIRMED: 'success',
          PENDING: 'warning',
          CANCELLED: 'danger',
        };
        const labels: Record<string, string> = {
          CONFIRMED: 'Đã thanh toán',
          PENDING: 'Chờ thanh toán',
          CANCELLED: 'Đã hủy',
        };
        return (
          <Badge variant={variants[b.status] || 'warning'} size="sm">
            {labels[b.status] || b.status}
          </Badge>
        );
      },
    },
    {
      key: 'checkin',
      title: 'Check-in',
      render: (b) => {
        const checkedIn = isBookingCheckedIn(b.id);
        return (
          <Badge variant={checkedIn ? 'success' : 'neutral'} size="sm">
            {checkedIn ? 'Đã check-in' : 'Chưa check-in'}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      title: 'Thời gian đặt',
      render: (b) => (
        <span className="text-slate-500 text-xs">
          {b.createdAt.split('T')[1]?.slice(0, 5)} {b.createdAt.split('T')[0]}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (b) => {
        const checkedIn = isBookingCheckedIn(b.id);
        const isCancelled = b.status === 'CANCELLED';

        return (
          <div className="flex items-center gap-1.5">
            {!checkedIn && !isCancelled && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleQuickCheckin(b)}
                title="Check-in vé ngay"
                aria-label={`Check-in vé ${b.bookingCode}`}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                icon={<CheckCircle className="w-3.5 h-3.5" />}
              />
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setViewingBooking(b)}
              title="Xem chi tiết đơn vé"
              aria-label={`Xem chi tiết đơn ${b.bookingCode}`}
              icon={<Eye className="w-3.5 h-3.5" />}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handlePrint(b)}
              title="In vé điện tử"
              aria-label={`In vé đơn ${b.bookingCode}`}
              icon={<Printer className="w-3.5 h-3.5" />}
            />
            {!isCancelled && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDeletingItem(b)}
                title="Hủy đơn vé"
                aria-label={`Hủy đơn ${b.bookingCode}`}
                className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                icon={<Trash2 className="w-3.5 h-3.5" />}
              />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý đặt vé &amp; Đơn hàng</h2>
          <p className="text-xs text-slate-500 mt-0.5">Tổng số {totalCount} đơn đặt vé trong hệ thống</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={<QrCode className="w-4 h-4 text-emerald-600" />}
            onClick={() => setIsCheckinModalOpen(true)}
          >
            Check-in vé
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Tạo vé mới
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Tìm theo mã đơn, tên khách, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <Table columns={columns} data={paginatedData} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Modal 1: TẠO VÉ MỚI (TẠI QUẦY) */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Tạo vé xe mới (Bán vé tại quầy)"
          description="Khởi tạo đơn đặt vé trực tiếp và chỉ định ghế ngồi cho khách hàng"
          size="md"
        >
          <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Họ và tên hành khách"
                required
                placeholder="VD: Nguyễn Văn A"
                value={createForm.passengerName}
                onChange={(e) => setCreateForm({ ...createForm, passengerName: e.target.value })}
              />
              <Input
                label="Số điện thoại"
                required
                type="tel"
                placeholder="VD: 0912345678"
                value={createForm.passengerPhone}
                onChange={(e) => setCreateForm({ ...createForm, passengerPhone: e.target.value })}
              />
            </div>

            <Select
              label="Chọn chuyến xe"
              value={createForm.tripId}
              onChange={(e) => {
                const trip = mockTrips.find((t) => t.id === e.target.value);
                setCreateForm({
                  ...createForm,
                  tripId: e.target.value,
                  price: trip?.price || createForm.price,
                });
              }}
              options={mockTrips.map((t) => {
                const route = mockRoutes.find((r) => r.id === t.routeId);
                const dep = mockStations.find((s) => s.id === route?.departureStationId)?.name || 'Hà Nội';
                const arr = mockStations.find((s) => s.id === route?.arrivalStationId)?.name || 'Ninh Bình';
                const time = t.departureTime.split('T')[1]?.slice(0, 5) || '08:00';
                return {
                  value: t.id,
                  label: `${dep} → ${arr} (${time} • ${formatCurrency(t.price)})`,
                };
              })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Số ghế (Seat number)"
                required
                placeholder="VD: 01, 02, A05..."
                value={createForm.seatNumber}
                onChange={(e) => setCreateForm({ ...createForm, seatNumber: e.target.value })}
              />
              <Input
                label="Giá vé (VNĐ)"
                required
                type="number"
                min={10000}
                step={5000}
                value={createForm.price}
                onChange={(e) => setCreateForm({ ...createForm, price: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Phương thức thanh toán"
                value={createForm.paymentMethod}
                onChange={(e) => setCreateForm({ ...createForm, paymentMethod: e.target.value })}
                options={[
                  { value: 'CASH', label: 'Tiền mặt tại quầy' },
                  { value: 'BANK_TRANSFER', label: 'Chuyển khoản VietQR' },
                ]}
              />
              <Select
                label="Trạng thái thanh toán"
                value={createForm.paymentStatus}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    paymentStatus: e.target.value as 'CONFIRMED' | 'PENDING',
                  })
                }
                options={[
                  { value: 'CONFIRMED', label: 'Đã thanh toán (CONFIRMED)' },
                  { value: 'PENDING', label: 'Chờ thanh toán (PENDING)' },
                ]}
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" variant="primary" icon={<Plus className="w-4 h-4" />}>
                Xác nhận tạo vé
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: CHECK-IN VÉ NHANH */}
      {isCheckinModalOpen && (
        <Modal
          isOpen={isCheckinModalOpen}
          onClose={() => {
            setIsCheckinModalOpen(false);
            setCheckinSearchCode('');
          }}
          title="Tra cứu & Check-in vé xe"
          description="Nhập mã đơn vé hoặc mã vé để kiểm tra thông tin và làm thủ tục lên xe"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Nhập mã đơn (XV-xxxxx) hoặc mã vé (TCK-...)"
                  value={checkinSearchCode}
                  onChange={(e) => setCheckinSearchCode(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
            </div>

            {matchedBookingForCheckin ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">
                      Đơn vé #{matchedBookingForCheckin.bookingCode}
                    </span>
                    <span className="text-xs text-slate-500">
                      Hành khách: {getCustomer(matchedBookingForCheckin.customerId)?.fullName} (
                      {getCustomer(matchedBookingForCheckin.customerId)?.phone})
                    </span>
                  </div>
                  <Badge
                    variant={isBookingCheckedIn(matchedBookingForCheckin.id) ? 'success' : 'warning'}
                    size="md"
                  >
                    {isBookingCheckedIn(matchedBookingForCheckin.id) ? 'Đã check-in' : 'Chưa check-in'}
                  </Badge>
                </div>

                <div className="text-xs space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tuyến xe:</span>
                    <span className="font-semibold text-slate-900">{getBookingRoute()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ghế ngồi:</span>
                    <span className="font-bold text-[#1E3A5F]">
                      Ghế {getBookingSeats(matchedBookingForCheckin.id)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tổng thanh toán:</span>
                    <span className="font-black text-[#C2410C]">
                      {formatCurrency(matchedBookingForCheckin.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant={isBookingCheckedIn(matchedBookingForCheckin.id) ? 'outline' : 'primary'}
                    fullWidth
                    disabled={isBookingCheckedIn(matchedBookingForCheckin.id)}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={handleConfirmModalCheckin}
                  >
                    {isBookingCheckedIn(matchedBookingForCheckin.id)
                      ? 'Vé đã được check-in trước đó'
                      : 'Xác nhận Check-in ngay'}
                  </Button>
                </div>
              </div>
            ) : checkinSearchCode ? (
              <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-dashed border-slate-200">
                Không tìm thấy vé nào khớp với mã "{checkinSearchCode}". Vui lòng kiểm tra lại.
              </div>
            ) : (
              <div className="p-4 bg-blue-50/60 rounded-xl text-xs text-slate-600 border border-blue-100 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#1E3A5F] shrink-0" />
                <span>Nhập mã đơn hoặc số điện thoại vào ô tìm kiếm để tiến hành check-in.</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCheckinModalOpen(false);
                  setCheckinSearchCode('');
                }}
              >
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 3: XEM CHI TIẾT & IN VÉ */}
      {viewingBooking && (
        <Modal
          isOpen={Boolean(viewingBooking)}
          onClose={() => setViewingBooking(null)}
          title={`Chi tiết đơn vé #${viewingBooking.bookingCode}`}
          size="md"
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-blue-50/80 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2">
                <TicketIcon className="w-5 h-5 text-[#1E3A5F]" />
                <div>
                  <span className="font-bold text-sm text-slate-900">Mã vé: {viewingBooking.bookingCode}</span>
                  <span className="block text-[11px] text-slate-500">Kênh đặt: {viewingBooking.channel}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant={isBookingCheckedIn(viewingBooking.id) ? 'success' : 'neutral'} size="md">
                  {isBookingCheckedIn(viewingBooking.id) ? 'Đã check-in' : 'Chưa check-in'}
                </Badge>
                <Badge variant={viewingBooking.status === 'CONFIRMED' ? 'success' : 'warning'} size="md">
                  {viewingBooking.status === 'CONFIRMED' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 border-b border-slate-200 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Hành khách:</span>
                <span className="font-bold text-slate-900">{getCustomer(viewingBooking.customerId)?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số điện thoại:</span>
                <span className="font-bold text-slate-900">{getCustomer(viewingBooking.customerId)?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tuyến đường:</span>
                <span className="font-bold text-slate-900">{getBookingRoute()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ghế ngồi đã chọn:</span>
                <span className="font-bold text-[#1E3A5F]">Ghế {getBookingSeats(viewingBooking.id)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-bold pt-1">
              <span>Tổng thanh toán:</span>
              <span className="text-lg font-black text-[#C2410C]">{formatCurrency(viewingBooking.totalAmount)}</span>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 mt-2">
              <Button variant="ghost" onClick={() => setViewingBooking(null)}>
                Đóng
              </Button>
              {!isBookingCheckedIn(viewingBooking.id) && viewingBooking.status !== 'CANCELLED' && (
                <Button
                  variant="outline"
                  icon={<CheckCircle className="w-4 h-4 text-emerald-600" />}
                  onClick={() => {
                    handleQuickCheckin(viewingBooking);
                  }}
                >
                  Check-in vé
                </Button>
              )}
              <Button
                variant="primary"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => handlePrint(viewingBooking)}
              >
                In vé ngay
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Dialog xác nhận hủy đơn */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        title="Hủy đơn đặt vé"
        message={`Bạn có chắc muốn hủy đơn đặt vé #${deletingItem?.bookingCode}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
        danger
        confirmText="Hủy đơn"
      />
    </div>
  );
};

export default BookingPage;
