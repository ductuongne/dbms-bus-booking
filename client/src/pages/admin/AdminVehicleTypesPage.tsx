import React, { useEffect, useState } from 'react';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import {
  busService,
  type CreateBusTypePayload,
  type UpdateBusTypePayload,
} from '../../services/bus.service';
import type { BusType } from '../../types';

export const AdminVehicleTypesPage: React.FC = () => {
  const [busTypes, setBusTypes] = useState<BusType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<BusType | null>(null);
  const [typeName, setTypeName] = useState('');
  const [totalSeats, setTotalSeats] = useState(34);
  const [floors, setFloors] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const data = await busService.getAllBusTypes();
        if (!ignore) {
          setBusTypes(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách loại xe');
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

  const openCreateModal = () => {
    setEditingType(null);
    setTypeName('');
    setTotalSeats(34);
    setFloors(2);
    setShowModal(true);
  };

  const openEditModal = (type: BusType) => {
    setEditingType(type);
    setTypeName(type.name);
    setTotalSeats(type.totalSeats);
    setFloors(type.floors);
    setShowModal(true);
  };

  const handleDelete = async (typeId: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa loại xe "${name}"?`)) return;
    try {
      await busService.deleteBusType(typeId);
      setReloadKey((k) => k + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể xóa loại xe (có thể đang có xe gắn với loại này)');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) {
      alert('Vui lòng nhập tên loại xe');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingType) {
        const payload: UpdateBusTypePayload = {
          name: typeName.trim(),
          totalSeats: Number(totalSeats),
          floors: Number(floors),
        };
        await busService.updateBusType(editingType.id, payload);
      } else {
        const payload: CreateBusTypePayload = {
          name: typeName.trim(),
          totalSeats: Number(totalSeats),
          floors: Number(floors),
        };
        await busService.createBusType(payload);
      }
      setShowModal(false);
      setReloadKey((k) => k + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi khi lưu loại xe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            <span>Quản lý Loại Xe &amp; Cấu hình Chỗ Ngồi</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Định nghĩa cấu hình số chỗ, số tầng dùng để tự động tạo sơ đồ ghế cho phương tiện
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Loại Xe Mới</span>
        </button>
      </div>

      {/* Grid of Bus Types */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500">Đang tải danh sách loại xe...</p>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-rose-600 bg-white rounded-2xl border border-rose-200 text-xs">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {busTypes.map((type) => (
            <div
              key={type.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {type.id}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    {type.floors === 2 ? 'Xe 2 tầng' : 'Xe 1 tầng'}
                  </span>
                </div>

                <h3 className="font-black text-gray-900 text-base">{type.name}</h3>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Số ghế</span>
                    <span className="font-bold text-gray-900 text-sm">{type.totalSeats} chỗ</span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Số tầng</span>
                    <span className="font-bold text-gray-900 text-sm">{type.floors} tầng</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(type)}
                  className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Sửa</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(type.id, type.name)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                  title="Xóa loại xe"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-indigo-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingType ? 'Chỉnh Sửa Loại Xe' : 'Thêm Loại Xe Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tên loại xe <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Xe Giường Nằm 34"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tổng số ghế <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Số tầng <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={floors}
                    onChange={(e) => setFloors(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value={1}>1 tầng (Ghế ngồi, Limousine)</option>
                    <option value={2}>2 tầng (Giường nằm)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicleTypesPage;

