import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Building2 } from 'lucide-react';
import type { Station, TableColumn } from '../types';
import { mockStations, mockProvinces } from '../mocks/mockData';
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

export const StationsPage: React.FC = () => {
  const { success } = useToast();
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('ALL');

  const {
    data,
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
  } = useCrudState<Station>({
    initialData: mockStations,
    searchFilter: (s, q) =>
      s.id.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q),
    pageSize: 10,
  });

  const [formData, setFormData] = useState<Partial<Station>>({
    name: '',
    provinceId: mockProvinces[0]?.id || '',
    address: '',
  });

  const getProvinceName = (provId: string) => {
    return mockProvinces.find((p) => p.id === provId)?.name || provId;
  };

  // Lọc thêm theo Tỉnh nếu người dùng chọn
  const displayedStations = selectedProvinceId === 'ALL'
    ? paginatedData
    : data.filter((s) => s.provinceId === selectedProvinceId);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      provinceId: mockProvinces[0]?.id || '',
      address: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (station: Station) => {
    setEditingItem(station);
    setFormData({ ...station });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItem('id', editingItem.id, formData);
      success('Cập nhật bến xe thành công!');
    } else {
      const newStation: Station = {
        id: `STA-${Date.now().toString().slice(-4)}`,
        name: formData.name || '',
        provinceId: formData.provinceId || mockProvinces[0].id,
        address: formData.address || '',
      };
      addItem(newStation);
      success('Tạo bến xe mới thành công!');
    }
  };

  const handleDelete = () => {
    if (deletingItem) {
      deleteItem('id', deletingItem.id);
      success('Đã xóa bến xe thành công!');
    }
  };

  const columns: TableColumn<Station>[] = [
    {
      key: 'id',
      title: 'Mã bến',
      render: (s) => <span className="font-bold text-slate-900">{s.id}</span>,
    },
    {
      key: 'name',
      title: 'Tên bến / Văn phòng',
      render: (s) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#1E3A5F]" />
          <span className="font-semibold text-slate-900">{s.name}</span>
        </div>
      ),
    },
    {
      key: 'provinceId',
      title: 'Tỉnh / Thành phố',
      render: (s) => <Badge variant="brand" size="sm">{getProvinceName(s.provinceId)}</Badge>,
    },
    {
      key: 'address',
      title: 'Địa chỉ chi tiết',
      render: (s) => <span className="text-slate-600">{s.address}</span>,
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (s) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(s)}
            aria-label={`Sửa bến ${s.id}`}
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#1E3A5F] hover:bg-slate-100 cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingItem(s)}
            aria-label={`Xóa bến ${s.id}`}
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
          <h2 className="text-xl font-bold text-slate-900">Quản lý bến xe &amp; Văn phòng đón trả</h2>
          <p className="text-xs text-slate-500 mt-0.5">Tổng số {totalCount} bến xe trên toàn quốc</p>
        </div>
        <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
          Thêm bến xe mới
        </Button>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-sm">
          <Input
            placeholder="Tìm theo mã, tên bến, địa chỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Lọc theo Tỉnh:</span>
          <select
            value={selectedProvinceId}
            onChange={(e) => setSelectedProvinceId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-800"
          >
            <option value="ALL">Tất cả Tỉnh/TP</option>
            {mockProvinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Table columns={columns} data={displayedStations} />

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
        title={editingItem ? 'Cập nhật bến xe' : 'Thêm bến xe mới'}
        size="md"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs">
          <Input
            label="Tên bến xe / Văn phòng"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ví dụ: Bến xe Mỹ Đình"
            required
          />

          <Select
            label="Tỉnh / Thành phố"
            value={formData.provinceId || ''}
            onChange={(e) => setFormData({ ...formData, provinceId: e.target.value })}
            options={mockProvinces.map((p) => ({ value: p.id, label: p.name }))}
            required
          />

          <Input
            label="Địa chỉ chi tiết"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Số nhà, tên đường, phường/xã..."
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
              {editingItem ? 'Lưu thay đổi' : 'Tạo bến xe'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        title="Xóa bến xe"
        message={`Bạn có chắc muốn xóa bến xe ${deletingItem?.name}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
        danger
        confirmText="Xóa bến"
      />
    </div>
  );
};

export default StationsPage;
