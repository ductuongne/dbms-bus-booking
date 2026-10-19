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

export const AdminVehiclesPage: React.FC = () => {
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
      alert(err instanceof Error ? err.message : 'Không thể xem sơ đồ ghế');
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
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể đổi trạng thái xe');
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
      setReloadKey((k) => k + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể xóa xe');
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
      alert('Vui lòng nhập biển số xe');
      return;
    }
    if (!newTypeId) {
      alert('Vui lòng chọn loại xe');
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
      alert('Tạo xe và tự động sinh toàn bộ sơ đồ ghế thành công!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo xe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Bus className="w-6 h-6 text-[#1E3A5F]" />
            <span>Quản lý Phương Tiện &amp; Đội Xe</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý thông tin biển số, cấu hình sơ đồ ghế và trạng thái vận hành xe khách
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (busTypes.length > 0 && !newTypeId) {
              setNewTypeId(busTypes[0]?.id ?? '');
            }
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#162C48] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Xe Mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Tìm theo biển số (ví dụ: 51B-12345) hoặc mã xe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-gray-800 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-48 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-transparent text-xs text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả loại xe</option>
            {busTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.totalSeats} chỗ)
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-40 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-transparent text-xs text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động (ACTIVE)</option>
            <option value="INACTIVE">Tạm dừng (INACTIVE)</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
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
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          bus.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Bấm để đổi trạng thái"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            bus.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}
                        />
                        <span>{bus.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}</span>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewDetail(bus.id)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1E3A5F] font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem ghế</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteBus(bus.id, bus.licensePlate)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="Xóa hoặc ngừng hoạt động xe"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col">
            <div className="px-6 py-4 bg-[#1E3A5F] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-200" />
                  <span>Thêm Xe Mới &amp; Sinh Sơ Đồ Ghế Tự Động</span>
                </h3>
                <span className="text-[11px] text-blue-100">
                  Transaction SQL Server Atomic: Tạo xe + Tự động sinh danh sách ghế tương ứng
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* License Plate */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Biển số xe <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 51B-999.88"
                    value={newLicensePlate}
                    onChange={(e) => setNewLicensePlate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold uppercase focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] focus:outline-none"
                  />
                </div>

                {/* Bus Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Chọn Loại xe <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newTypeId}
                    onChange={(e) => setNewTypeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] focus:outline-none cursor-pointer"
                  >
                    {busTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.totalSeats} chỗ • {t.floors} tầng)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Trạng thái khởi tạo</label>
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
                    <span>Hoạt động (ACTIVE)</span>
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
                    <span>Tạm dừng (INACTIVE)</span>
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
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#1E3A5F] hover:bg-[#162C48] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Đang tạo xe & ghế...' : 'Lưu Xe & Tạo Ghế'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW BUS DETAIL & SEAT LAYOUT MODAL */}
      {viewingBusDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col">
            <div className="px-6 py-4 bg-gray-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-blue-300 font-bold uppercase">
                  Mã xe: {viewingBusDetail.id}
                </span>
                <h3 className="font-bold text-base">
                  Biển số: {viewingBusDetail.licensePlate} • {viewingBusDetail.typeName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingBusDetail(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <SeatLayoutVisualizer
                seats={viewingBusDetail.seats}
                floors={viewingBusDetail.floors}
                interactive={false}
                title={`Sơ đồ ghế thực tế từ CSDL (${viewingBusDetail.seats.length} ghế)`}
              />
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingBusDetail(null)}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehiclesPage;

