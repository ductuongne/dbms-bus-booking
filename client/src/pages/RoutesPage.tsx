import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import type { Route, TableColumn } from '../types';
import { mockRoutes, mockStations } from '../mocks/mockData';
import { useCrudState } from '../hooks/useCrudState';
import { useToast } from '../hooks/useToast';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';

export const RoutesPage: React.FC = () => {
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
  } = useCrudState<Route>({
    initialData: mockRoutes,
    searchFilter: (r, q) =>
      r.id.toLowerCase().includes(q) ||
      (mockStations.find((s) => s.id === r.departureStationId)?.name.toLowerCase().includes(q) ?? false) ||
      (mockStations.find((s) => s.id === r.arrivalStationId)?.name.toLowerCase().includes(q) ?? false),
    pageSize: 10,
  });

  const [formData, setFormData] = useState<Partial<Route>>({
    departureStationId: mockStations[0]?.id || '',
    arrivalStationId: mockStations[1]?.id || '',
    distanceKm: 100,
    estimatedDuration: 90,
  });

  const getStationName = (stationId: string) => {
    return mockStations.find((s) => s.id === stationId)?.name || stationId;
  };

  const handleOpenCreate = () => {
    setFormData({
      departureStationId: mockStations[0]?.id || '',
      arrivalStationId: mockStations[1]?.id || '',
      distanceKm: 100,
      estimatedDuration: 90,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (route: Route) => {
    setEditingItem(route);
    setFormData({ ...route });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItem('id', editingItem.id, formData);
      success('Cập nhật tuyến đường thành công!');
    } else {
      const newRoute: Route = {
        id: `RT-${Date.now().toString().slice(-4)}`,
        departureStationId: formData.departureStationId || mockStations[0].id,
        arrivalStationId: formData.arrivalStationId || mockStations[1].id,
        distanceKm: Number(formData.distanceKm) || 100,
        estimatedDuration: Number(formData.estimatedDuration) || 90,
      };
      addItem(newRoute);
      success('Tạo tuyến đường mới thành công!');
    }
  };

  const handleDelete = () => {
    if (deletingItem) {
      deleteItem('id', deletingItem.id);
      success('Đã xóa tuyến đường thành công!');
    }
  };

  const columns: TableColumn<Route>[] = [
    {
      key: 'id',
      title: 'Mã tuyến',
      render: (r) => <span className="font-bold text-slate-900">{r.id}</span>,
    },
    {
      key: 'departureStationId',
      title: 'Bến khởi hành',
      render: (r) => <span className="font-semibold">{getStationName(r.departureStationId)}</span>,
    },
    {
      key: 'arrivalStationId',
      title: 'Bến đến',
      render: (r) => <span className="font-semibold">{getStationName(r.arrivalStationId)}</span>,
    },
    {
      key: 'distanceKm',
      title: 'Khoảng cách',
      render: (r) => <span>{r.distanceKm} km</span>,
    },
    {
      key: 'estimatedDuration',
      title: 'Thời gian ước tính',
      render: (r) => (
        <span>
          {Math.floor(r.estimatedDuration / 60)}g {r.estimatedDuration % 60}ph
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(r)}
            aria-label={`Sửa tuyến ${r.id}`}
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#1E3A5F] hover:bg-slate-100 cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingItem(r)}
            aria-label={`Xóa tuyến ${r.id}`}
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
          <h2 className="text-xl font-bold text-slate-900">Quản lý tuyến đường</h2>
          <p className="text-xs text-slate-500 mt-0.5">Tổng số {totalCount} tuyến đường vận hành</p>
        </div>
        <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
          Thêm tuyến mới
        </Button>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Tìm theo mã tuyến, bến xe..."
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

      <Modal
        isOpen={isCreateModalOpen || Boolean(editingItem)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Cập nhật tuyến đường' : 'Thêm tuyến đường mới'}
        size="md"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs">
          <Select
            label="Bến khởi hành"
            value={formData.departureStationId || ''}
            onChange={(e) => setFormData({ ...formData, departureStationId: e.target.value })}
            options={mockStations.map((s) => ({ value: s.id, label: `${s.name} (${s.provinceId})` }))}
            required
          />

          <Select
            label="Bến đến"
            value={formData.arrivalStationId || ''}
            onChange={(e) => setFormData({ ...formData, arrivalStationId: e.target.value })}
            options={mockStations.map((s) => ({ value: s.id, label: `${s.name} (${s.provinceId})` }))}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Khoảng cách (km)"
              type="number"
              value={formData.distanceKm || 0}
              onChange={(e) => setFormData({ ...formData, distanceKm: Number(e.target.value) })}
              required
            />

            <Input
              label="Thời gian ước tính (phút)"
              type="number"
              value={formData.estimatedDuration || 0}
              onChange={(e) => setFormData({ ...formData, estimatedDuration: Number(e.target.value) })}
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
              {editingItem ? 'Lưu thay đổi' : 'Tạo tuyến'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        title="Xóa tuyến đường"
        message={`Bạn có chắc muốn xóa tuyến đường ${deletingItem?.id}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
        danger
        confirmText="Xóa tuyến"
      />
    </div>
  );
};

export default RoutesPage;
