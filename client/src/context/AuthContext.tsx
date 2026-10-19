import React, { useState } from 'react';
import type { User } from '../types';
import { AuthContext } from '../hooks/useAuth';
import { mockUsers } from '../mocks/mockData';

const AUTH_STORAGE_KEY = 'xeviet_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as User;
      }
    } catch {
      // Bỏ qua lỗi truy cập sessionStorage
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(`${AUTH_STORAGE_KEY}_token`) || null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    // Giả lập độ trễ mạng 300ms
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const cleanEmail = email.trim().toLowerCase();

      // Kiểm tra tài khoản test admin
      if (cleanEmail === 'admin@example.com' && pass === 'admin123') {
        const adminUser = mockUsers.find((u) => u.email === 'admin@example.com') || mockUsers[0];
        setUser(adminUser);
        const fakeToken = `mock_token_admin_${Date.now()}`;
        setToken(fakeToken);
        try {
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
          sessionStorage.setItem(`${AUTH_STORAGE_KEY}_token`, fakeToken);
        } catch {
          // Bỏ qua lỗi lưu sessionStorage
        }
        setIsLoading(false);
        return { success: true };
      }

      // Kiểm tra tài khoản khác trong mockUsers
      const foundUser = mockUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (foundUser) {
        setUser(foundUser);
        const fakeToken = `mock_token_${foundUser.id}_${Date.now()}`;
        setToken(fakeToken);
        try {
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser));
          sessionStorage.setItem(`${AUTH_STORAGE_KEY}_token`, fakeToken);
        } catch {
          // Bỏ qua lỗi lưu sessionStorage
        }
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return {
        success: false,
        message: 'Email hoặc mật khẩu không chính xác. Thử admin@example.com / admin123',
      };
    } catch {
      setIsLoading(false);
      return { success: false, message: 'Đã xảy ra lỗi khi đăng nhập.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(`${AUTH_STORAGE_KEY}_token`);
    } catch {
      // Bỏ qua lỗi
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

