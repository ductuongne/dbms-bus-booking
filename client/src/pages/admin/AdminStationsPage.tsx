import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, Building } from 'lucide-react';
import {
  stationService,
  type CreateStationPayload,
  type UpdateStationPayload,
} from '../../services/station.service';
import type { StationDetailView, Province } from '../../types';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';

export const AdminStationsPage: React.FC = () => {
  const [stations, setStations] = useState<StationDetailView[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Search & Filter
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedProvinceId, setSelectedProvinceId] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingStation, setEditingStation] = useState<StationDetailView | null>(null);
  const [stationName, setStationName] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const [stationsData, provincesData] = await Promise.all([
          stationService.getAllStations(),
          stationService.getAllProvinces(),
        ]);
        if (!ignore) {
          setStations(stationsData);
          setProvinces(provincesData);
          setProvinceId((prev) => prev || (provincesData[0]?.id ?? ''));
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách bến xe');
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

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      const matchProvince = !selectedProvinceId || s.provinceId === selectedProvinceId;
      const query = searchKeyword.toLowerCase().trim();
      const matchQuery =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query) ||
        s.provinceName.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query);
      return matchProvince && matchQuery;
    });
  }, [stations, selectedProvinceId, searchKeyword]);

  const openCreateModal = () => {
    setEditingStation(null);
    setStationName('');
    if (provinces.length > 0) setProvinceId(provinces[0]?.id ?? '');
    setAddress('');
    setShowModal(true);
  };

  const openEditModal = (station: StationDetailView) => {
    setEditingStation(station);
    setStationName(station.name);
    setProvinceId(station.provinceId);
    setAddress(station.address);
    setShowModal(true);
  };

  const handleDelete = async (stationId: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bến xe "${name}"?`)) return;
    try {
      await stationService.deleteStation(stationId);
      setReloadKey((k) => k + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể xóa bến xe (có thể đang có tuyến đường gắn với bến này)');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationName.trim()) {
      alert('Vui lòng nhập tên bến xe');
      return;
    }
    if (!provinceId) {
      alert('Vui lòng chọn tỉnh/thành phố');
      return;
    }
    if (!address.trim()) {
      alert('Vui lòng nhập địa chỉ bến xe');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingStation) {
        const payload: UpdateStationPayload = {
          name: stationName.trim(),
          provinceId,
          address: address.trim(),
        };
        await stationService.updateStation(editingStation.id, payload);
      } else {
        const payload: CreateStationPayload = {
          name: stationName.trim(),
          provinceId,
          address: address.trim(),
        };
        await stationService.createStation(payload);
      }
      setShowModal(false);
      setReloadKey((k) => k + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi khi lưu bến xe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Bến Xe &amp; Trạm Dừng Chân</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý các điểm xuất phát, điểm kết thúc và các trạm trung gian của các tuyến xe
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
        >
          Thêm bến xe mới
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Tìm theo tên bến, địa chỉ hoặc mã..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={selectedProvinceId}
            onChange={(e) => setSelectedProvinceId(e.target.value)}
            options={[
              { value: '', label: 'Tất cả tỉnh / thành' },
              ...provinces.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </div>
      </div>

      {/* Stations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Đang tải danh sách bến xe...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-xs">{error}</div>
        ) : filteredStations.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Building className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-gray-700">Chưa có bến xe nào phù hợp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Mã bến</th>
                  <th className="px-5 py-3.5">Tên bến xe</th>
                  <th className="px-5 py-3.5">Tỉnh / Thành</th>
                  <th className="px-5 py-3.5">Địa chỉ chi tiết</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredStations.map((station) => (
                  <tr key={station.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-gray-900">{station.id}</td>
                    <td className="px-5 py-4 font-bold text-gray-900 text-sm">
                      {station.name}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="brand" size="sm">
                        {station.provinceName}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-gray-600 max-w-md truncate">
                      {station.address}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                          onClick={() => openEditModal(station)}
                          title="Chỉnh sửa bến xe"
                          aria-label={`Chỉnh sửa bến ${station.name}`}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          onClick={() => handleDelete(station.id, station.name)}
                          title="Xóa bến xe"
                          aria-label={`Xóa bến ${station.name}`}
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

      {/* Modal Create/Edit */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingStation ? 'Chỉnh Sửa Bến Xe' : 'Thêm Bến Xe Mới'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên bến xe *"
            required
            placeholder="VD: Bến xe Miền Đông mới"
            value={stationName}
            onChange={(e) => setStationName(e.target.value)}
          />

          <Select
            label="Tỉnh / Thành phố *"
            required
            value={provinceId}
            onChange={(e) => setProvinceId(e.target.value)}
            options={provinces.map((p) => ({
              value: p.id,
              label: p.name,
            }))}
          />

          <Input
            label="Địa chỉ chi tiết *"
            required
            placeholder="VD: Số 501 Hoàng Hữu Nam, Phường Long Bình, TP. Thủ Đức"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

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

export default AdminStationsPage;

