import api from './api';
import type { DriverScheduleDto } from '../types/driver';

export interface DriverSchedulesApiResponse {
  success: boolean;
  message?: string;
  data: DriverScheduleDto[];
}

export interface DriverPassengerDto {
  ticketId: string;
  ticketCode: string;
  seatNumber: string;
  passengerName: string;
  passengerPhone: string;
  price: number;
  status: string;
}

export const driverService = {
  /**
   * Lấy danh sách lịch trình chuyến xe được phân công cho tài xế đang đăng nhập
   */
  getSchedules: async (): Promise<DriverScheduleDto[]> => {
    const res = await api.get<DriverSchedulesApiResponse>('/private/driver/schedules');
    return res.data || [];
  },

  /**
   * Lấy danh sách bảng kê hành khách (vé) của chuyến xe
   */
  getTripPassengers: async (tripId: string): Promise<DriverPassengerDto[]> => {
    const res = await api.get<{ success: boolean; data: DriverPassengerDto[] }>(
      `/private/driver/trips/${tripId}/passengers`
    );
    return res.data || [];
  },

  /**
   * Soát vé hành khách lên xe
   */
  checkInTicket: async (ticketCode: string): Promise<{ success: boolean; message: string; data?: unknown }> => {
    return await api.post('/private/driver/check-in', { ticketCode });
  },

  /**
   * Cập nhật trạng thái chuyến xe (Khởi hành / Hoàn thành)
   */
  updateTripStatus: async (
    tripId: string,
    status: 'DEPARTED' | 'COMPLETED'
  ): Promise<{ success: boolean; message: string }> => {
    return await api.patch(`/private/driver/trips/${tripId}/status`, { status });
  },
};

export default driverService;
