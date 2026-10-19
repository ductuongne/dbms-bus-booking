import React from 'react';
import { Search, UserCheck, Lock, Unlock } from 'lucide-react';
import type { User, TableColumn } from '../types';
import { mockUsers } from '../mocks/mockData';
import { useCrudState } from '../hooks/useCrudState';
import { useToast } from '../hooks/useToast';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export const CustomersPage: React.FC = () => {
  const { success } = useToast();
  const customerList = mockUsers.filter((u) => u.role === 'CUSTOMER');

  const {
    paginatedData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    updateItem,
  } = useCrudState<User>({
    initialData: customerList,
    searchFilter: (u, q) =>
      u.id.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q),
    pageSize: 10,
  });

  const handleToggleStatus = (customer: User) => {
    const updatedStatus = !customer.isActive;
    updateItem('id', customer.id, { isActive: updatedStatus });
    success(
      updatedStatus
        ? `Đã kích hoạt lại tài khoản ${customer.fullName}`
        : `Đã khóa tài khoản khách hàng ${customer.fullName}`
    );
  };

  const columns: TableColumn<User>[] = [
    {
      key: 'id',
      title: 'Mã khách hàng',
      render: (u) => <span className="font-bold text-slate-900">{u.id}</span>,
    },
    {
      key: 'fullName',
      title: 'Họ và tên',
      render: (u) => (
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#1E3A5F]" />
          <span className="font-bold text-slate-900">{u.fullName}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'Số điện thoại',
      render: (u) => <span className="text-slate-700">{u.phone}</span>,
    },
    {
      key: 'email',
      title: 'Email',
      render: (u) => <span className="text-slate-600">{u.email}</span>,
    },
    {
      key: 'loyaltyPoints',
      title: 'Điểm tích lũy',
      render: (u) => (
        <Badge variant="brand" size="sm">
          {u.loyaltyPoints} điểm
        </Badge>
      ),
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
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleToggleStatus(u)}
          aria-label={u.isActive ? `Khóa tài khoản ${u.fullName}` : `Kích hoạt tài khoản ${u.fullName}`}
          className={
            u.isActive
              ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
              : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
          }
          icon={u.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        >
          {u.isActive ? 'Khóa' : 'Kích hoạt'}
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý khách hàng</h2>
          <p className="text-xs text-slate-500 mt-0.5">Tổng số {totalCount} khách hàng đăng ký</p>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Tìm theo tên, email, số điện thoại..."
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
    </div>
  );
};

export default CustomersPage;
