import React, { useState } from 'react';
import { Search, Printer, Eye, Trash2, Ticket as TicketIcon } from 'lucide-react';
import type { Booking, TableColumn } from '../types';
import { mockBookings, mockUsers, mockRoutes, mockStations, mockTickets } from '../mocks/mockData';
import { formatCurrency } from '../utils';
import { useCrudState } from '../hooks/useCrudState';
import { useToast } from '../hooks/useToast';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';

export const BookingPage: React.FC = () => {
  const { success } = useToast();
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  const {
    paginatedData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    deletingItem,
    setDeletingItem,
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

  const getCustomer = (customerId: string) => {
    return mockUsers.find((u) => u.id === customerId);
  };

  const getBookingSeats = (bookingId: string) => {
    const tickets = mockTickets.filter((t) => t.bookingId === bookingId);
    if (tickets.length > 0) {
      return tickets.map((t) => t.seatId.split('-').pop()).join(', ');
    }
    return '01, 02';
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
      render: (b) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewingBooking(b)}
            title="Xem chi tiết đơn vé"
            aria-label={`Xem chi tiết đơn ${b.bookingCode}`}
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#1E3A5F] hover:bg-slate-100 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handlePrint(b)}
            title="In vé điện tử"
            aria-label={`In vé đơn ${b.bookingCode}`}
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#1E3A5F] hover:bg-slate-100 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingItem(b)}
            title="Hủy đơn vé"
            aria-label={`Hủy đơn ${b.bookingCode}`}
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý đặt vé &amp; Đơn hàng</h2>
          <p className="text-xs text-slate-500 mt-0.5">Tổng số {totalCount} đơn đặt vé trong hệ thống</p>
        </div>
      </div>

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

      {/* Modal Xem chi tiết & In vé */}
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
              <Badge variant={viewingBooking.status === 'CONFIRMED' ? 'success' : 'warning'} size="md">
                {viewingBooking.status === 'CONFIRMED' ? 'Đã thanh toán' : 'Chờ thanh toán'}
              </Badge>
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
