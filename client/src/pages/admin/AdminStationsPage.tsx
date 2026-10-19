import React, { useEffect, useState, useMemo } from 'react';
import { MapPin, Plus, Edit2, Trash2, Search, Building } from 'lucide-react';
import {
  stationService,
  type CreateStationPayload,
  type UpdateStationPayload,
} from '../../services/station.service';
import type { StationDetailView, Province } from '../../types';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-indigo-600" />
            <span>Quản lý Bến Xe &amp; Trạm Dừng Chân</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý các điểm xuất phát, điểm kết thúc và các trạm trung gian của các tuyến xe
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Bến Xe Mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Tìm theo tên bến, địa chỉ hoặc mã..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full bg-transparent text-xs text-gray-800 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-60 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
          <select
            value={selectedProvinceId}
            onChange={(e) => setSelectedProvinceId(e.target.value)}
            className="w-full bg-transparent text-xs text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả tỉnh / thành</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stations Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
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
                      <span className="inline-block bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                        {station.provinceName}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 max-w-md truncate">
                      {station.address}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(station)}
                          className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(station.id, station.name)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="Xóa bến xe"
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

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-indigo-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingStation ? 'Chỉnh Sửa Bến Xe' : 'Thêm Bến Xe Mới'}
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
                  Tên bến xe <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Bến xe Miền Đông mới"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tỉnh / Thành phố <span className="text-rose-500">*</span>
                </label>
                <select
                  value={provinceId}
                  onChange={(e) => setProvinceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Địa chỉ chi tiết <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Số 501 Hoàng Hữu Nam, Phường Long Bình, TP. Thủ Đức"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
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

export default AdminStationsPage;

