import api from './api';
import type { AuthUser } from '../types/auth';

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

export interface AuthApiResponse {
  success: boolean;
  message?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
  data?: {
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    user?: AuthUser;
  };
}

export interface AuthResult {
  token: string;
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshTokenApiResponse {
  success: boolean;
  token?: string;
  accessToken?: string;
  data?: {
    token?: string;
    accessToken?: string;
  };
}

export interface RefreshTokenResult {
  token: string;
  accessToken: string;
}

export const authService = {
  /**
   * Đăng nhập người dùng bằng Số điện thoại và Mật khẩu
   */
  login: async (credentials: LoginCredentials): Promise<AuthResult> => {
    const res = await api.post<AuthApiResponse>('/public/login', credentials);
    const token = res.data?.token || res.token || res.data?.accessToken || res.accessToken;
    const accessToken = res.data?.accessToken || res.accessToken || token;
    const refreshToken = res.data?.refreshToken || res.refreshToken;
    const user = res.data?.user || res.user;

    if (!token || !user) {
      throw new Error('Không nhận được mã xác thực (token) từ máy chủ.');
    }

    return {
      token,
      accessToken: accessToken || token,
      refreshToken: refreshToken || '',
      user,
    };
  },

  /**
   * Đăng ký tài khoản khách hàng mới
   */
  register: async (payload: RegisterPayload): Promise<{ success: boolean; message: string }> => {
    const res = await api.post<AuthApiResponse>('/public/register', payload);
    return {
      success: res.success !== false,
      message: res.message || 'Đăng ký tài khoản thành công.',
    };
  },

  /**
   * Làm mới Access Token bằng Refresh Token
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResult> => {
    const res = await api.post<RefreshTokenApiResponse>('/public/refresh-token', { refreshToken });
    const token = res.data?.token || res.token || res.data?.accessToken || res.accessToken;
    const accessToken = res.data?.accessToken || res.accessToken || token;

    if (!token) {
      throw new Error('Làm mới phiên đăng nhập thất bại.');
    }

    return {
      token,
      accessToken: accessToken || token,
    };
  },

  /**
   * Lấy thông tin tài khoản hiện tại từ máy chủ
   */
  getCurrentUser: async (): Promise<AuthUser> => {
    const res = await api.get<{ success: boolean; data: AuthUser }>('/private/me');
    return res.data;
  },

  /**
   * Đăng xuất người dùng và dọn dẹp bộ nhớ cục bộ
   */
  logout: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    sessionStorage.clear();
  },
};

export default authService;
