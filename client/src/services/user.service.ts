import api from './api';
import type { AdminUser, CreateUserInput, UpdateUserInput } from '../types/admin';

export interface UserApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface DriverOption {
  driverId: string;
  userId: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
}

export const userService = {
  /**
   * Lấy danh sách toàn bộ người dùng trong hệ thống (Dành cho ADMIN)
   */
  getAllUsers: async (): Promise<AdminUser[]> => {
    const res = await api.get<UserApiResponse<AdminUser[]>>('/private/admin/users');
    return res.data || [];
  },

  /**
   * Lấy danh sách tài xế hợp lệ phục vụ phân công chuyến xe
   */
  getDrivers: async (): Promise<DriverOption[]> => {
    const res = await api.get<UserApiResponse<DriverOption[]>>('/private/admin/drivers');
    return res.data || [];
  },

  /**
   * Tạo tài khoản người dùng mới (ADMIN, STAFF, DRIVER, CUSTOMER)
   */
  createUser: async (payload: CreateUserInput): Promise<AdminUser> => {
    const res = await api.post<UserApiResponse<AdminUser>>('/private/admin/users', payload);
    return res.data;
  },

  /**
   * Cập nhật thông tin người dùng theo userId
   */
  updateUser: async (userId: string, payload: UpdateUserInput): Promise<AdminUser> => {
    const res = await api.put<UserApiResponse<AdminUser>>(`/private/admin/users/${userId}`, payload);
    return res.data;
  },

  /**
   * Khóa hoặc kích hoạt tài khoản người dùng (Soft-delete / Toggle status)
   */
  toggleUserStatus: async (userId: string, isActive: boolean): Promise<AdminUser> => {
    const res = await api.patch<UserApiResponse<AdminUser>>(
      `/private/admin/users/${userId}/status`,
      { isActive }
    );
    return res.data;
  },
};

export default userService;
