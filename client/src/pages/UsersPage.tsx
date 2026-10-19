import React, { useState } from 'react';
import { Plus, Search, Edit2, Shield, Lock, Unlock } from 'lucide-react';
import type { User, TableColumn, UserRole } from '../types';
import { mockUsers } from '../mocks/mockData';
import { USER_ROLES } from '../constants';
import { useCrudState } from '../hooks/useCrudState';
import { useToast } from '../hooks/useToast';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Badge from '../components/common/Badge';

export const UsersPage: React.FC = () => {
  const { success } = useToast();
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

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
    addItem,
    updateItem,
  } = useCrudState<User>({
    initialData: mockUsers,
    searchFilter: (u, q) =>
      u.id.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q),
    pageSize: 10,
  });

  const [formData, setFormData] = useState<Partial<User>>({
    fullName: '',
    email: '',
    phone: '',
    role: USER_ROLES.CUSTOMER,
    isActive: true,
  });

  const displayedUsers = selectedRoleFilter === 'ALL'
    ? paginatedData
    : data.filter((u) => u.role === selectedRoleFilter);

  const handleOpenCreate = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      role: USER_ROLES.CUSTOMER,
      isActive: true,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingItem(user);
    setFormData({ ...user });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItem('id', editingItem.id, formData);
      success(`Cập nhật người dùng ${formData.fullName} thành công!`);
    } else {
      const newUser: User = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        fullName: formData.fullName || '',
        email: formData.email || '',
        phone: formData.phone || '',
        role: formData.role || USER_ROLES.CUSTOMER,
        loyaltyPoints: 0,
        isActive: formData.isActive ?? true,
      };
      addItem(newUser);
      success('Thêm tài khoản người dùng mới thành công!');
    }
  };

  const handleToggleStatus = (user: User) => {
    const updatedStatus = !user.isActive;
    updateItem('id', user.id, { isActive: updatedStatus });
    success(
      updatedStatus
        ? `Đã mở khóa tài khoản ${user.fullName}`
        : `Đã khóa tài khoản ${user.fullName}`
    );
  };

  const columns: TableColumn<User>[] = [
    {
      key: 'id',
      title: 'Mã tài khoản',
      render: (u) => <span className="font-bold text-slate-900">{u.id}</span>,
    },
    {
      key: 'fullName',
      title: 'Họ và tên',
      render: (u) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#1E3A5F]" />
          <span className="font-bold text-slate-900">{u.fullName}</span>
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      render: (u) => <span className="text-slate-700">{u.email}</span>,
    },
    {
      key: 'phone',
      title: 'Số điện thoại',
      render: (u) => <span className="text-slate-600">{u.phone}</span>,
    },
    {
      key: 'role',
      title: 'Vai trò',
      render: (u) => {
        const variants: Record<string, 'brand' | 'warning' | 'neutral' | 'success'> = {
          ADMIN: 'brand',
          STAFF: 'warning',
          DRIVER: 'neutral',
          CUSTOMER: 'success',
        };
        return (
          <Badge variant={variants[u.role] || 'neutral'} size="sm">
            {u.role}
          </Badge>
        );
      },
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      render: (u) => (
        <Badge variant={u.isActive ? 'success' : 'danger'} size="sm">
          {u.isActive ? 'Hoạt động' : 'Đã khóa'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (u) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(u)}
            aria-label={`Sửa tài khoản ${u.fullName}`}
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#1E3A5F] hover:bg-slate-100 cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus(u)}
            aria-label={u.isActive ? `Khóa tài khoản ${u.fullName}` : `Mở khóa tài khoản ${u.fullName}`}
            className={`p-1.5 rounded-lg cursor-pointer ${
              u.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-700 hover:bg-green-50'
            }`}
          >
            {u.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý người dùng &amp; Phân quyền</h2>
          <p className="text-xs text-slate-500 mt-0.5">Tổng số {totalCount} tài khoản thành viên trong hệ thống</p>
        </div>
        <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
          Thêm người dùng mới
        </Button>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-sm">
          <Input
            placeholder="Tìm theo tên, email, vai trò..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Lọc theo vai trò:</span>
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-800"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value={USER_ROLES.ADMIN}>ADMIN (Quản trị)</option>
            <option value={USER_ROLES.STAFF}>STAFF (Nhân viên)</option>
            <option value={USER_ROLES.DRIVER}>DRIVER (Tài xế)</option>
            <option value={USER_ROLES.CUSTOMER}>CUSTOMER (Khách hàng)</option>
          </select>
        </div>
      </div>

      <Table columns={columns} data={displayedUsers} />

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
        title={editingItem ? 'Cập nhật tài khoản' : 'Thêm tài khoản người dùng'}
        size="md"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs">
          <Input
            label="Họ và tên"
            value={formData.fullName || ''}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Ví dụ: Nguyễn Văn An"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@xeviet.vn"
              required
            />

            <Input
              label="Số điện thoại"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0988000111"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Vai trò (Role)"
              value={formData.role || USER_ROLES.CUSTOMER}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              options={[
                { value: USER_ROLES.ADMIN, label: 'ADMIN (Quản trị viên)' },
                { value: USER_ROLES.STAFF, label: 'STAFF (Nhân viên điều hành)' },
                { value: USER_ROLES.DRIVER, label: 'DRIVER (Tài xế)' },
                { value: USER_ROLES.CUSTOMER, label: 'CUSTOMER (Khách hàng)' },
              ]}
              required
            />

            <Select
              label="Trạng thái tài khoản"
              value={formData.isActive ? 'ACTIVE' : 'LOCKED'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'ACTIVE' })}
              options={[
                { value: 'ACTIVE', label: 'Hoạt động (Active)' },
                { value: 'LOCKED', label: 'Tạm khóa (Locked)' },
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
              {editingItem ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
