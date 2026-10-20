import React, { useState, useMemo } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import type { AdminUser, CreateUserInput, UpdateUserInput } from '../../types/admin';
import { Button, Alert, Input, Select } from '../../components/common';
import { UserTable } from './components/UserTable';
import { UserFormModal } from './components/UserFormModal';

export const AdminDashboardPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const {
    users,
    isLoading,
    error,
    isSubmitting,
    refresh,
    toggleStatus,
    saveUser,
  } = useAdminUsers();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null);

  // Client-side Search & Role Filter
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.userId.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, selectedRole, searchQuery]);

  const handleFormSubmit = async (formData: CreateUserInput | UpdateUserInput) => {
    const success = await saveUser(formData, userToEdit?.userId);
    if (success) {
      setIsModalOpen(false);
      setUserToEdit(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Quản lý tài khoản &amp; Người dùng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị danh sách nhân sự, tài xế và khách hàng toàn hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
            }
            onClick={refresh}
            disabled={isLoading}
          >
            Làm mới
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setUserToEdit(null);
              setIsModalOpen(true);
            }}
          >
            Thêm người dùng
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Thông báo hệ thống">
          {error}
        </Alert>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex-1 w-full">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Tìm kiếm theo mã, họ tên, số điện thoại hoặc email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-60">
          <Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            aria-label="Lọc theo vai trò"
            options={[
              { value: 'ALL', label: 'Tất cả vai trò' },
              { value: 'CUSTOMER', label: 'Khách hàng' },
              { value: 'STAFF', label: 'Nhân viên bán vé' },
              { value: 'DRIVER', label: 'Tài xế' },
              { value: 'ADMIN', label: 'Quản trị viên' },
            ]}
          />
        </div>
      </div>

      {/* Presentational Table */}
      <UserTable
        users={filteredUsers}
        isLoading={isLoading}
        onEdit={(u) => {
          setUserToEdit(u);
          setIsModalOpen(true);
        }}
        onToggleStatus={toggleStatus}
        currentUserId={currentAdmin?.userId}
      />

      {/* Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        userToEdit={userToEdit}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default AdminDashboardPage;
