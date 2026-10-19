import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import type { Trip, TableColumn } from '../types';
import { mockTrips, mockRoutes, mockBuses, mockDrivers, mockStations } from '../mocks/mockData';
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

export const TripsPage: React.FC = () => {
  const { success } = useToast();

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
    editingItem,
    setEditingItem,
    deletingItem,
    setDeletingItem,
    addItem,
    updateItem,
    deleteItem,
  } = useCrudState<Trip>({
    initialData: mockTrips,
    searchFilter: (trip, q) =>
      trip.id.toLowerCase().includes(q) ||
      trip.routeId.toLowerCase().includes(q) ||
      trip.busId.toLowerCase().includes(q),
    pageSize: 10,
  });

  // State cho Form Thêm/Sửa
  const [formData, setFormData] = useState<Partial<Trip>>({
    routeId: mockRoutes[0]?.id || '',
    busId: mockBuses[0]?.id || '',
    driverId: mockDrivers[0]?.id || '',
    departureTime: '2026-10-19T08:00:00',
    arrivalTime: '2026-10-19T10:00:00',
    price: 180000,
    status: 'SCHEDULED',
  });

  const getRouteLabel = (routeId: string) => {
    const route = mockRoutes.find((r) => r.id === routeId);
    if (!route) return routeId;
    const dep = mockStations.find((s) => s.id === route.departureStationId)?.name || 'Hà Nội';
    const arr = mockStations.find((s) => s.id === route.arrivalStationId)?.name || 'Ninh Bình';
    return `${dep} → ${arr}`;
  };

  const getBusLabel = (busId: string) => {
    const bus = mockBuses.find((b) => b.id === busId);
    return bus ? bus.licensePlate : busId;
  };

  const handleOpenCreate = () => {
    setFormData({
      routeId: mockRoutes[0]?.id || '',
      busId: mockBuses[0]?.id || '',
      driverId: mockDrivers[0]?.id || '',
      departureTime: '2026-10-19T08:00:00',
      arrivalTime: '2026-10-19T10:00:00',
      price: 180000,
      status: 'SCHEDULED',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (trip: Trip) => {
    setEditingItem(trip);
    setFormData({ ...trip });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItem('id', editingItem.id, formData);
      success('Cập nhật chuyến xe thành công!');
    } else {
      const newTrip: Trip = {
        id: `TRIP-${Date.now().toString().slice(-4)}`,
        routeId: formData.routeId || mockRoutes[0].id,
        busId: formData.busId || mockBuses[0].id,
        driverId: formData.driverId || mockDrivers[0].id,
        departureTime: formData.departureTime || '',
        arrivalTime: formData.arrivalTime || '',
        price: Number(formData.price) || 180000,
        status: formData.status || 'SCHEDULED',
      };
      addItem(newTrip);
      success('Tạo chuyến xe mới thành công!');
    }
  };

  const handleDelete = () => {
    if (deletingItem) {
      deleteItem('id', deletingItem.id);
      success('Đã hủy chuyến xe thành công!');
    }
  };

  const columns: TableColumn<Trip>[] = [
    {
      key: 'id',
      title: 'Mã chuyến',
      render: (trip) => <span className="font-bold text-slate-900">{trip.id}</span>,
    },
    {
      key: 'routeId',
      title: 'Tuyến đường',
      render: (trip) => <span className="font-semibold">{getRouteLabel(trip.routeId)}</span>,
    },
    {
      key: 'busId',
      title: 'Biển số xe',
      render: (trip) => (
        <Badge variant="brand" size="sm">
          {getBusLabel(trip.busId)}
        </Badge>
      ),
    },
    {
      key: 'departureTime',
      title: 'Giờ chạy',
      render: (trip) => (
        <div>
          <span className="font-bold">{trip.departureTime.split('T')[1]?.slice(0, 5) || trip.departureTime}</span>
          <span className="block text-[11px] text-slate-500">{trip.departureTime.split('T')[0]}</span>
        </div>
      ),
    },
    {
      key: 'price',
      title: 'Giá vé',
      render: (trip) => (
        <span className="font-bold text-[#C2410C]">{formatCurrency(trip.price)}</span>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (trip) => {
        const variants: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'brand'> = {
          SCHEDULED: 'warning',
          DEPARTED: 'brand',
          COMPLETED: 'success',
          CANCELLED: 'danger',
        };
        const labels: Record<string, string> = {
          SCHEDULED: 'Sắp chạy',
          DEPARTED: 'Đang chạy',
          COMPLETED: 'Hoàn thành',
          CANCELLED: 'Đã hủy',
        };
        return (
          <Badge variant={variants[trip.status] || 'neutral'} size="sm">
            {labels[trip.status] || trip.status}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (trip) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(trip)}
            title="Chỉnh sửa chuyến xe"
            aria-label={`Chỉnh sửa chuyến ${trip.id}`}
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#1E3A5F] hover:bg-slate-100 cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingItem(trip)}
            title="Hủy chuyến xe"
            aria-label={`Hủy chuyến ${trip.id}`}
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý chuyến xe</h2>
          <p className="text-xs text-slate-500 mt-0.5">Tổng số {totalCount} chuyến xe trong hệ thống</p>
        </div>
        <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
          Thêm chuyến mới
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Tìm theo mã chuyến, mã xe, tuyến..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} data={paginatedData} />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Modal Thêm / Sửa chuyến xe */}
      <Modal
        isOpen={isCreateModalOpen || Boolean(editingItem)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Cập nhật chuyến xe' : 'Thêm chuyến xe mới'}
        size="md"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs">
          <Select
            label="Tuyến đường vận hành"
            value={formData.routeId || ''}
            onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
            options={mockRoutes.map((r) => ({
              value: r.id,
              label: getRouteLabel(r.id),
            }))}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Phương tiện (Xe)"
              value={formData.busId || ''}
              onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
              options={mockBuses.map((b) => ({
                value: b.id,
                label: `${b.licensePlate} (${b.typeId})`,
              }))}
              required
            />

            <Select
              label="Tài xế phụ trách"
              value={formData.driverId || ''}
              onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
              options={mockDrivers.map((d) => ({
                value: d.id,
                label: `${d.id} - ${d.licenseNumber}`,
              }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Thời gian khởi hành (ISO)"
              value={formData.departureTime || ''}
              onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
              placeholder="YYYY-MM-DDTHH:mm:ss"
              required
            />

            <Input
              label="Thời gian đến dự kiến"
              value={formData.arrivalTime || ''}
              onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
              placeholder="YYYY-MM-DDTHH:mm:ss"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Giá vé cơ bản (VND)"
              type="number"
              value={formData.price || 0}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
            />

            <Select
              label="Trạng thái chuyến"
              value={formData.status || 'SCHEDULED'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Trip['status'] })}
              options={[
                { value: 'SCHEDULED', label: 'Sắp chạy' },
                { value: 'DEPARTED', label: 'Đang chạy' },
                { value: 'COMPLETED', label: 'Hoàn thành' },
                { value: 'CANCELLED', label: 'Đã hủy' },
              ]}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingItem(null);
              }}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingItem ? 'Lưu thay đổi' : 'Tạo chuyến'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dialog xác nhận hủy chuyến */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        title="Xác nhận hủy chuyến xe"
        message={`Bạn có chắc chắn muốn hủy chuyến xe ${deletingItem?.id}? Hành động này sẽ thông báo tới các hành khách đã giữ chỗ.`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
        danger
        confirmText="Hủy chuyến xe"
      />
    </div>
  );
};

export default TripsPage;
