import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Bus as BusIcon } from 'lucide-react';
import type { Bus, TableColumn } from '../types';
import { mockBuses } from '../mocks/mockData';
import { BUS_LAYOUT_CONFIGS } from '../constants';
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

export const VehiclesPage: React.FC = () => {
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
  } = useCrudState<Bus>({
    initialData: mockBuses,
    searchFilter: (b, q) =>
      b.id.toLowerCase().includes(q) ||
      b.licensePlate.toLowerCase().includes(q) ||
      b.typeId.toLowerCase().includes(q),
    pageSize: 10,
  });

  const [formData, setFormData] = useState<Partial<Bus>>({
    licensePlate: '',
    typeId: 'BT-LIM-09',
    status: 'ACTIVE',
  });

  const getBusTypeName = (typeId: string) => {
    const config = BUS_LAYOUT_CONFIGS[typeId as keyof typeof BUS_LAYOUT_CONFIGS];
    return config ? config.name : typeId;
  };

  const getBusTotalSeats = (typeId: string) => {
    const config = BUS_LAYOUT_CONFIGS[typeId as keyof typeof BUS_LAYOUT_CONFIGS];
    return config ? config.totalSeats : 0;
  };

  const handleOpenCreate = () => {
    setFormData({
      licensePlate: '',
      typeId: 'BT-LIM-09',
      status: 'ACTIVE',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (bus: Bus) => {
    setEditingItem(bus);
    setFormData({ ...bus });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItem('id', editingItem.id, formData);
      success('Cập nhật phương tiện thành công!');
    } else {
      const newBus: Bus = {
        id: `BUS-${Date.now().toString().slice(-4)}`,
        licensePlate: formData.licensePlate || '',
        typeId: formData.typeId || 'BT-LIM-09',
        status: formData.status || 'ACTIVE',
      };
      addItem(newBus);
      success('Thêm phương tiện mới thành công!');
    }
  };

  const handleDelete = () => {
    if (deletingItem) {
      deleteItem('id', deletingItem.id);
      success('Đã xóa phương tiện thành công!');
    }
  };

  const columns: TableColumn<Bus>[] = [
    {
      key: 'id',
      title: 'Mã xe',
      render: (b) => <span className="font-bold text-slate-900">{b.id}</span>,
    },
    {
      key: 'licensePlate',
      title: 'Biển kiểm soát',
      render: (b) => (
        <div className="flex items-center gap-2">
          <BusIcon className="w-4 h-4 text-[#1E3A5F]" />
          <span className="font-bold text-sm bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {b.licensePlate}
          </span>
        </div>
      ),
    },
    {
      key: 'typeId',
      title: 'Loại xe (Đúng 3 loại ở B5)',
      render: (b) => <span className="font-semibold text-slate-900">{getBusTypeName(b.typeId)}</span>,
    },
    {
      key: 'totalSeats',
      title: 'Tổng số ghế (Tự động từ config)',
      render: (b) => (
        <Badge variant="brand" size="sm">
          {getBusTotalSeats(b.typeId)} ghế
        </Badge>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (b) => (
        <Badge variant={b.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
          {b.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngưng'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (b) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(b)}
            aria-label={`Sửa xe ${b.licensePlate}`}
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#1E3A5F] hover:bg-slate-100 cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingItem(b)}
            aria-label={`Xóa xe ${b.licensePlate}`}
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
          <h2 className="text-xl font-bold text-slate-900">Quản lý phương tiện</h2>
          <p className="text-xs text-slate-500 mt-0.5">Tổng số {totalCount} xe hoạt động trong đội xe XeViet</p>
        </div>
        <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
          Thêm xe mới
        </Button>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Tìm theo biển số, mã xe, loại xe..."
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
        title={editingItem ? 'Cập nhật phương tiện' : 'Thêm phương tiện mới'}
        size="md"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs">
          <Input
            label="Biển số xe"
            value={formData.licensePlate || ''}
            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
            placeholder="Ví dụ: 29B-888.12"
            required
          />

          <Select
            label="Loại xe vận hành (Lấy số ghế tự động theo B5)"
            value={formData.typeId || 'BT-LIM-09'}
            onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
            options={Object.values(BUS_LAYOUT_CONFIGS).map((c) => ({
              value: c.busTypeCode,
              label: `${c.name} (${c.totalSeats} ghế - ${c.floors} tầng)`,
            }))}
            required
          />

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            Tổng số ghế: <strong className="text-slate-900">{getBusTotalSeats(formData.typeId || 'BT-LIM-09')} ghế</strong> (quy định tự động bởi cấu hình sơ đồ xe B5, không gõ tay).
          </div>

          <Select
            label="Trạng thái phương tiện"
            value={formData.status || 'ACTIVE'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Bus['status'] })}
            options={[
              { value: 'ACTIVE', label: 'Đang hoạt động (ACTIVE)' },
              { value: 'INACTIVE', label: 'Tạm ngưng vận hành (INACTIVE)' },
            ]}
            required
          />

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
              {editingItem ? 'Lưu thay đổi' : 'Thêm xe'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        title="Xóa phương tiện"
        message={`Bạn có chắc muốn xóa xe mang biển số ${deletingItem?.licensePlate}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
        danger
        confirmText="Xóa xe"
      />
    </div>
  );
};

export default VehiclesPage;
