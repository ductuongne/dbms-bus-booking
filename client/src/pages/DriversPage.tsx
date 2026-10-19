import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, UserCheck } from 'lucide-react';
import type { Driver, TableColumn } from '../types';
import { mockDrivers, mockUsers } from '../mocks/mockData';
import { useCrudState } from '../hooks/useCrudState';
import { useToast } from '../hooks/useToast';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

interface DriverRow extends Driver {
  fullName?: string;
  phone?: string;
  email?: string;
}

export const DriversPage: React.FC = () => {
  const { success } = useToast();

  const initialDriverRows: DriverRow[] = mockDrivers.map((d) => {
    const user = mockUsers.find((u) => u.id === d.userId);
    return {
      ...d,
      fullName: user?.fullName || 'Tài xế',
      phone: user?.phone || '0900000000',
      email: user?.email || '',
    };
  });

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
  } = useCrudState<DriverRow>({
    initialData: initialDriverRows,
    searchFilter: (d, q) =>
      d.id.toLowerCase().includes(q) ||
      (d.fullName?.toLowerCase().includes(q) ?? false) ||
      d.licenseNumber.toLowerCase().includes(q) ||
      (d.phone?.includes(q) ?? false),
    pageSize: 10,
  });

  const [formData, setFormData] = useState<Partial<DriverRow>>({
    fullName: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '2028-12-31',
  });

  const handleOpenCreate = () => {
    setFormData({
      fullName: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '2028-12-31',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (driver: DriverRow) => {
    setEditingItem(driver);
    setFormData({ ...driver });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItem('id', editingItem.id, formData);
      success('Cập nhật thông tin tài xế thành công!');
    } else {
      const newDriver: DriverRow = {
        id: `DRV-${Date.now().toString().slice(-4)}`,
        userId: `USR-${Date.now().toString().slice(-4)}`,
        fullName: formData.fullName || 'Tài xế mới',
        phone: formData.phone || '',
        licenseNumber: formData.licenseNumber || '',
        licenseExpiry: formData.licenseExpiry || '2028-12-31',
      };
      addItem(newDriver);
      success('Thêm tài xế mới thành công!');
    }
  };

  const handleDelete = () => {
    if (deletingItem) {
      deleteItem('id', deletingItem.id);
      success('Đã xóa tài xế thành công!');
    }
  };

  const columns: TableColumn<DriverRow>[] = [
    {
      key: 'id',
      title: 'Mã tài xế',
      render: (d) => <span className="font-bold text-slate-900">{d.id}</span>,
    },
    {
      key: 'fullName',
      title: 'Họ và tên',
      render: (d) => (
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#1E3A5F]" />
          <span className="font-bold text-slate-900">{d.fullName}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'Số điện thoại',
      render: (d) => <span className="text-slate-700">{d.phone}</span>,
    },
    {
      key: 'licenseNumber',
      title: 'Số GPLX',
      render: (d) => (
        <span className="font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
          {d.licenseNumber}
        </span>
      ),
    },
    {
      key: 'licenseExpiry',
      title: 'Hạn bằng lái',
      render: (d) => <span className="text-slate-600">{d.licenseExpiry}</span>,
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (d) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(d)}
            aria-label={`Sửa tài xế ${d.fullName}`}
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#1E3A5F] hover:bg-slate-100 cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingItem(d)}
            aria-label={`Xóa tài xế ${d.fullName}`}
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
          <h2 className="text-xl font-bold text-slate-900">Quản lý tài xế</h2>
          <p className="text-xs text-slate-500 mt-0.5">Tổng số {totalCount} tài xế trong đội ngũ vận hành</p>
        </div>
        <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
          Thêm tài xế mới
        </Button>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Tìm theo tên, SĐT, số GPLX..."
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
        title={editingItem ? 'Cập nhật tài xế' : 'Thêm tài xế mới'}
        size="md"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs">
          <Input
            label="Họ và tên tài xế"
            value={formData.fullName || ''}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Ví dụ: Trần Văn Lái"
            required
          />

          <Input
            label="Số điện thoại liên hệ"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Ví dụ: 0912345678"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Số giấy phép lái xe (GPLX)"
              value={formData.licenseNumber || ''}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              placeholder="Ví dụ: E-19402941"
              required
            />

            <Input
              label="Hạn bằng lái (YYYY-MM-DD)"
              value={formData.licenseExpiry || ''}
              onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
              type="date"
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
              {editingItem ? 'Lưu thay đổi' : 'Thêm tài xế'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        title="Xóa tài xế"
        message={`Bạn có chắc muốn xóa tài xế ${deletingItem?.fullName}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
        danger
        confirmText="Xóa tài xế"
      />
    </div>
  );
};

export default DriversPage;
