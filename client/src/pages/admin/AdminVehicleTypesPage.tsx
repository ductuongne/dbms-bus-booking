import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import {
  busService,
  type CreateBusTypePayload,
  type UpdateBusTypePayload,
} from '../../services/bus.service';
import type { BusType } from '../../types';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';

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
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Loại Xe &amp; Cấu hình Chỗ Ngồi</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Định nghĩa cấu hình số chỗ, số tầng dùng để tự động tạo sơ đồ ghế cho phương tiện
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
        >
          Thêm loại xe mới
        </Button>
      </div>

      {/* Grid of Bus Types */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-3 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto" />
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
                  <Badge variant="brand" size="sm">
                    {type.id}
                  </Badge>
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

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-end gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Edit2 className="w-3.5 h-3.5" />}
                  onClick={() => openEditModal(type)}
                  title="Chỉnh sửa loại xe"
                  aria-label={`Chỉnh sửa loại xe ${type.name}`}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => handleDelete(type.id, type.name)}
                  title="Xóa loại xe"
                  aria-label={`Xóa loại xe ${type.name}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create/Edit */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingType ? 'Chỉnh Sửa Loại Xe' : 'Thêm Loại Xe Mới'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên loại xe *"
            required
            placeholder="VD: Xe Giường Nằm 34"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tổng số ghế *"
              type="number"
              min="1"
              max="100"
              required
              value={totalSeats}
              onChange={(e) => setTotalSeats(Number(e.target.value))}
            />

            <Select
              label="Số tầng *"
              value={String(floors)}
              onChange={(e) => setFloors(Number(e.target.value))}
              options={[
                { value: '1', label: '1 tầng (Ghế ngồi, Limousine)' },
                { value: '2', label: '2 tầng (Giường nằm)' },
              ]}
            />
          </div>

          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Lưu lại
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminVehicleTypesPage;

