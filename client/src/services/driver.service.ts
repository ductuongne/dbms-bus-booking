import api from './api';
import type { DriverScheduleDto } from '../types/driver';

export interface DriverSchedulesApiResponse {
  success: boolean;
  message?: string;
  data: DriverScheduleDto[];
}

export const driverService = {
  /**
   * Lấy danh sách lịch trình chuyến xe được phân công cho tài xế đang đăng nhập
   */
  getSchedules: async (): Promise<DriverScheduleDto[]> => {
    const res = await api.get<DriverSchedulesApiResponse>('/private/driver/schedules');
    return res.data || [];
  },
};

export default driverService;
