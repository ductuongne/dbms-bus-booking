import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { RefreshCw, CalendarX, Loader2, UserCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { driverService } from '../../services/driver.service';
import type { DriverScheduleDto } from '../../types/driver';
import { Button, Alert } from '../../components/common';
import { DriverTripCard } from './components/DriverTripCard';

export const DriverSchedulesPage: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<DriverScheduleDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Tải dữ liệu lịch trình khi mount (kèm ignore flag dọn dẹp chuẩn React 19)
  useEffect(() => {
    let ignore = false;

    const fetchSchedules = async () => {
      try {
        const data = await driverService.getSchedules();
        if (!ignore) {
          setSchedules(data || []);
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : 'Không thể nạp lịch phân công tài xế.'
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void fetchSchedules();

    return () => {
      ignore = true;
    };
  }, []);

  // Thao tác làm mới thủ công
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await driverService.getSchedules();
      setSchedules(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối mạng. Vui lòng kiểm tra lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Lọc lịch trình theo trạng thái tab
  const filteredSchedules = useMemo(() => {
    if (filterStatus === 'ALL') return schedules;
    return schedules.filter((s) => s.tripStatus === filterStatus);
  }, [schedules, filterStatus]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner Thông tin tài xế */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2B4C7E] text-white p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-white/10 text-amber-400">
              <UserCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-400">
              Cổng Thông Tin Tài Xế
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Xin chào, {user?.fullName || 'Tài xế'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            SĐT: {user?.phone} | Mã tài khoản: {user?.userId}
          </p>
        </div>

        <Button
          variant="inverse"
          size="md"
          icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          onClick={handleRefresh}
          disabled={isLoading}
        >
          Làm mới lịch chạy
        </Button>
      </div>

      {error && (
        <Alert variant="error" title="Thông báo hệ thống">
          {error}
        </Alert>
      )}

      {/* Tabs Filter theo trạng thái */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { label: 'Tất cả chuyến', value: 'ALL' },
          { label: 'Sắp chạy', value: 'SCHEDULED' },
          { label: 'Đang di chuyển', value: 'DEPARTED' },
          { label: 'Đã hoàn thành', value: 'COMPLETED' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filterStatus === tab.value
                ? 'bg-[#1E3A5F] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body List of Schedules */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F]" />
          <span className="text-sm font-medium">Đang nạp lịch chạy được phân công...</span>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 bg-white rounded-2xl border border-slate-200">
          <CalendarX className="w-12 h-12 stroke-1 opacity-60 text-slate-400" />
          <h4 className="text-base font-bold text-slate-700">Chưa có lịch chạy nào được phân công</h4>
          <p className="text-xs text-slate-500 max-w-sm text-center">
            Bạn hiện chưa có chuyến xe nào theo bộ lọc đã chọn. Hãy liên hệ bộ phận điều phối nếu cần hỗ trợ.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.map((schedule) => (
            <DriverTripCard key={schedule.tripId} trip={schedule} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverSchedulesPage;
