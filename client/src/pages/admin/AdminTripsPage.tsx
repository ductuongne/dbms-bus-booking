import React, { useState } from 'react';
import { Calendar, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common';
import { useToast } from '../../hooks/useToast';
import { useAdminTrips } from './trips/hooks/useAdminTrips';
import { TripFilterBar } from './trips/components/TripFilterBar';
import { TripTable } from './trips/components/TripTable';
import { CreateTripModal } from './trips/components/CreateTripModal';

export const AdminTripsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    routes,
    buses,
    filteredTrips,
    loading,
    error,
    routeMap,
    busMap,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    refresh,
    createTrip,
    changeStatus,
    cancelTrip,
  } = useAdminTrips();

  const handleCreateTrip = async (payload: Parameters<typeof createTrip>[0]) => {
    try {
      await createTrip(payload);
      success('Tạo chuyến xe mới thành công!');
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Không thể tạo chuyến xe!');
    }
  };

  const handleChangeStatus = async (tripId: string, newStatus: 'DEPARTED' | 'COMPLETED') => {
    try {
      await changeStatus(tripId, newStatus);
      success(
        `Cập nhật trạng thái chuyến sang ${newStatus === 'DEPARTED' ? 'Đang chạy' : 'Hoàn thành'}!`
      );
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái chuyến');
    }
  };

  const handleCancelTrip = async (tripId: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy chuyến ${tripId}?`)) return;
    try {
      await cancelTrip(tripId);
      success('Hủy chuyến xe thành công!');
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Không thể hủy chuyến xe');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#1E3A5F]" />
            Quản lý Chuyến xe
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi, điều phối lịch trình, xe và trạng thái khởi hành thời gian thực
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Làm mới
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Thêm chuyến xe
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Toolbar */}
      <TripFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
      />

      {/* Trips Table */}
      <TripTable
        trips={filteredTrips}
        loading={loading}
        routeMap={routeMap}
        busMap={busMap}
        onChangeStatus={handleChangeStatus}
        onCancelTrip={handleCancelTrip}
      />

      {/* Modal Thêm chuyến xe mới */}
      <CreateTripModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        routes={routes}
        buses={buses}
        onSubmit={handleCreateTrip}
      />
    </div>
  );
};

export default AdminTripsPage;
