import React, { useEffect, useState, useMemo } from 'react';
import {
  Bus,
  Plus,
  Eye,
  Trash2,
  Search,
  Sparkles,
} from 'lucide-react';
import { busService, type CreateBusPayload } from '../../services/bus.service';
import type { BusListItemView, BusDetailView, BusType, SeatType } from '../../types';
import { SeatLayoutVisualizer, type VisualSeat } from '../../components/SeatLayoutVisualizer';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import { useToast } from '../../hooks/useToast';

export const AdminVehiclesPage: React.FC = () => {
  const { success: toastSuccess, error: toastError } = useToast();
  const [buses, setBuses] = useState<BusListItemView[]>([]);
  const [busTypes, setBusTypes] = useState<BusType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingBusDetail, setViewingBusDetail] = useState<BusDetailView | null>(null);

  // Create Bus Form State
  const [newLicensePlate, setNewLicensePlate] = useState('');
  const [newTypeId, setNewTypeId] = useState('');
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const [busesData, typesData] = await Promise.all([
          busService.getAllBuses(),
          busService.getAllBusTypes(),
        ]);
        if (!ignore) {
          setBuses(busesData);
          setBusTypes(typesData);
          setNewTypeId((prev) => prev || (typesData[0]?.id ?? ''));
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu xe từ SQL Server');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  // Filtered buses
  const filteredBuses = useMemo(() => {
    return buses.filter((b) => {
      const matchQuery =
        !searchQuery ||
        b.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = !filterType || b.typeId === filterType;
      const matchStatus = !filterStatus || b.status === filterStatus;
      return matchQuery && matchType && matchStatus;
    });
  }, [buses, searchQuery, filterType, filterStatus]);

  // View Bus Detail & Seats
  const handleViewDetail = async (busId: string) => {
    try {
      const detail = await busService.getBusById(busId);
      setViewingBusDetail(detail);
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Không thể xem sơ đồ ghế');
    }
  };

  // Toggle Bus Status
  const handleToggleStatus = async (bus: BusListItemView) => {
    const nextStatus = bus.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await busService.changeBusStatus(bus.id, nextStatus);
      setBuses((prev) =>
        prev.map((b) => (b.id === bus.id ? { ...b, status: nextStatus } : b))
      );
      toastSuccess(`Đã chuyển xe sang trạng thái ${nextStatus === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}`);
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Không thể đổi trạng thái xe');
    }
  };

  // Delete/Deactivate Bus
  const handleDeleteBus = async (busId: string, licensePlate: string) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa hoặc ngừng hoạt động xe biển số ${licensePlate}?`
      )
    ) {
      return;
    }
    try {
      await busService.deleteBus(busId);
      toastSuccess(`Đã xóa xe biển số ${licensePlate}`);
      setReloadKey((k) => k + 1);
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Không thể xóa xe');
    }
  };

  // Live Generated Preview for Create Modal (Requirement 7)
  const selectedTypeObj = busTypes.find((t) => t.id === newTypeId);
  const previewSeats = useMemo<VisualSeat[]>(() => {
    if (!selectedTypeObj) return [];
    const total = selectedTypeObj.totalSeats;
    const floors = selectedTypeObj.floors;
    const typeName = selectedTypeObj.name;
    const defaultSeatType: SeatType = typeName.includes('Giường')
      ? 'SLEEPER'
      : typeName.includes('Limousine')
      ? 'VIP'
      : 'NORMAL';

    const result: VisualSeat[] = [];
    if (floors <= 1) {
      for (let i = 1; i <= total; i++) {
        const num = i < 10 ? `A0${i}` : `A${i}`;
        result.push({ seatNumber: num, floor: 1, seatType: defaultSeatType });
      }
    } else {
      const f1Count = Math.ceil(total / 2);
      for (let i = 1; i <= f1Count; i++) {
        const num = i < 10 ? `A0${i}` : `A${i}`;
        result.push({ seatNumber: num, floor: 1, seatType: defaultSeatType });
      }
      const f2Count = total - f1Count;
      for (let i = 1; i <= f2Count; i++) {
        const num = i < 10 ? `B0${i}` : `B${i}`;
        result.push({ seatNumber: num, floor: 2, seatType: defaultSeatType });
      }
    }
    return result;
  }, [selectedTypeObj]);

  // Handle Create Bus Submit (Atomic Transaction in SQL Server - Requirement 8)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLicensePlate.trim()) {
      toastError('Vui lòng nhập biển số xe');
      return;
    }
    if (!newTypeId) {
      toastError('Vui lòng chọn loại xe');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateBusPayload = {
        licensePlate: newLicensePlate.trim(),
        typeId: newTypeId,
        status: newStatus,
      };

      await busService.createBus(payload);
      setShowCreateModal(false);
      setNewLicensePlate('');
      setReloadKey((k) => k + 1);
      toastSuccess('Tạo xe và tự động sinh toàn bộ sơ đồ ghế thành công!');
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo xe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Phương Tiện &amp; Đội Xe</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý thông tin biển số, cấu hình sơ đồ ghế và trạng thái vận hành xe khách
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            if (busTypes.length > 0 && !newTypeId) {
              setNewTypeId(busTypes[0]?.id ?? '');
            }
            setShowCreateModal(true);
          }}
        >
          Thêm xe mới
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Tìm theo biển số (ví dụ: 51B-12345) hoặc mã xe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-56">
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: '', label: 'Tất cả loại xe' },
              ...busTypes.map((t) => ({
                value: t.id,
                label: `${t.name} (${t.totalSeats} chỗ)`,
              })),
            ]}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'ACTIVE', label: 'Đang hoạt động' },
              { value: 'INACTIVE', label: 'Tạm dừng hoạt động' },
            ]}
          />
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Đang tải danh sách xe từ SQL Server...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-xs">{error}</div>
        ) : filteredBuses.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Bus className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-gray-700">Chưa có xe nào phù hợp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Mã xe</th>
                  <th className="px-5 py-3.5">Biển số</th>
                  <th className="px-5 py-3.5">Loại xe</th>
                  <th className="px-5 py-3.5">Số chỗ</th>
                  <th className="px-5 py-3.5">Số tầng</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredBuses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-gray-900">{bus.id}</td>
                    <td className="px-5 py-4">
                      <span className="font-mono font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                        {bus.licensePlate}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-800">{bus.typeName}</td>
                    <td className="px-5 py-4 text-gray-600">{bus.totalSeats} ghế</td>
                    <td className="px-5 py-4 text-gray-600">{bus.floors} tầng</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(bus)}
                        className="cursor-pointer"
                        title="Bấm để đổi trạng thái"
                      >
                        <Badge variant={bus.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                          <span
                            className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${
                              bus.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}
                          />
                          {bus.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => handleViewDetail(bus.id)}
                        >
                          Xem ghế
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          onClick={() => handleDeleteBus(bus.id, bus.licensePlate)}
                          title="Xóa hoặc ngừng hoạt động xe"
                          aria-label={`Xóa xe ${bus.licensePlate}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Requirement 7 & 8: CREATE BUS MODAL WITH ATOMIC SEAT GENERATOR PREVIEW */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Thêm Xe Mới & Sinh Sơ Đồ Ghế Tự Động"
        description="Transaction SQL Server Atomic: Tạo xe + Tự động sinh danh sách ghế tương ứng"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* License Plate */}
            <Input
              label="Biển số xe *"
              required
              placeholder="VD: 51B-999.88"
              value={newLicensePlate}
              onChange={(e) => setNewLicensePlate(e.target.value)}
            />

            {/* Bus Type Selector */}
            <Select
              label="Chọn Loại xe *"
              required
              value={newTypeId}
              onChange={(e) => setNewTypeId(e.target.value)}
              options={busTypes.map((t) => ({
                value: t.id,
                label: `${t.name} (${t.totalSeats} chỗ • ${t.floors} tầng)`,
              }))}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Trạng thái khởi tạo
            </label>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="ACTIVE"
                  checked={newStatus === 'ACTIVE'}
                  onChange={() => setNewStatus('ACTIVE')}
                  className="text-[#1E3A5F] focus:ring-[#1E3A5F]"
                />
                <span>Đang hoạt động</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="INACTIVE"
                  checked={newStatus === 'INACTIVE'}
                  onChange={() => setNewStatus('INACTIVE')}
                  className="text-[#1E3A5F] focus:ring-[#1E3A5F]"
                />
                <span>Tạm dừng hoạt động</span>
              </label>
            </div>
          </div>

          {/* Requirement 7: LIVE SEAT PREVIEW */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1E3A5F] font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#1E3A5F]" />
                <span>Xem trước Sơ đồ ghế sẽ được tạo tự động</span>
              </div>
              <span className="text-xs font-bold text-gray-700">
                {previewSeats.length} ghế • {selectedTypeObj?.floors ?? 1} tầng
              </span>
            </div>

            <SeatLayoutVisualizer
              seats={previewSeats}
              floors={selectedTypeObj?.floors ?? 1}
              interactive={false}
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Lưu Xe &amp; Tạo Ghế
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW BUS DETAIL & SEAT LAYOUT MODAL */}
      <Modal
        isOpen={Boolean(viewingBusDetail)}
        onClose={() => setViewingBusDetail(null)}
        title={`Biển số: ${viewingBusDetail?.licensePlate ?? ''} • ${viewingBusDetail?.typeName ?? ''}`}
        description={`Mã xe: ${viewingBusDetail?.id ?? ''}`}
        maxWidth="xl"
      >
        {viewingBusDetail && (
          <div className="space-y-4">
            <SeatLayoutVisualizer
              seats={viewingBusDetail.seats}
              floors={viewingBusDetail.floors}
              interactive={false}
              title={`Sơ đồ ghế thực tế từ CSDL (${viewingBusDetail.seats.length} ghế)`}
            />

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setViewingBusDetail(null)}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminVehiclesPage;

