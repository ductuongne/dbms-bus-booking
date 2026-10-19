import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Bus, LogIn } from 'lucide-react';
import { api } from '../lib/api';
import type { ApiErrorResponse } from '../types/auth';
import { Input, Alert } from '../components/common';
import { BRAND_INFO } from '../constants';

import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
const loginSchema = z.object({
  phone: z
    .string()
    .regex(
      /^(0[3|5|7|8|9])+([0-9]{8})$/,
      'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)'
    ),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LocationState {
  from?: { pathname: string };
  registeredSuccess?: boolean;
}

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const locationState = location.state as LocationState | null;
  const registeredSuccess = locationState?.registeredSuccess;
  const redirectUrl =
    locationState?.from?.pathname ||
    (user?.role === 'ADMIN' || user?.role === 'STAFF'
      ? '/admin'
      : user?.role === 'DRIVER'
      ? '/driver/schedule'
      : '/');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      let response;
      try {
        response = await api.post('/public/login', data);
      } catch (postErr) {
        if (postErr instanceof AxiosError && postErr.response?.status === 404) {
          response = await api.post('/public/auth/login', data);
        } else {
          throw postErr;
        }
      }

      const token = response.data?.data?.token || response.data?.token || response.data?.accessToken;
      const refreshToken = response.data?.data?.refreshToken || response.data?.refreshToken;
      const loggedInUser = response.data?.data?.user || response.data?.user;
      if (!token) {
        throw new Error('Không nhận được mã xác thực (token) từ máy chủ.');
      }
      login(token, loggedInUser, refreshToken);
      const targetUrl =
        locationState?.from?.pathname ||
        (loggedInUser?.role === 'ADMIN' || loggedInUser?.role === 'STAFF'
          ? '/admin'
          : loggedInUser?.role === 'DRIVER'
          ? '/driver/schedule'
          : '/');
      navigate(targetUrl, { replace: true });

    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data) {
        const apiErr = err.response.data as ApiErrorResponse;
        setServerError(
          apiErr.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản và mật khẩu.'
        );
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-bg text-slate-900">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-2xl font-black text-brand hover:opacity-90 transition-opacity"
            aria-label={`Về trang chủ ${BRAND_INFO.name}`}
          >
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white shadow-xs">
              <Bus className="w-6 h-6" />
            </div>
            <span>
              Xe<span className="text-action">Viet</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 mt-4">Đăng nhập tài khoản</h1>
          <p className="text-xs text-slate-500 mt-1">
            Đặt vé xe khách nhanh chóng và an toàn cùng {BRAND_INFO.name}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">

          {isAuthenticated ? (
            <div className="space-y-4">
              <Alert variant="success" title="Đang trong phiên đăng nhập">
                Bạn hiện đang đăng nhập với tài khoản{' '}
                <strong>{user?.fullName || user?.userId}</strong> ({user?.role}).
              </Alert>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(redirectUrl, { replace: true })}
                  className="w-full py-2.5 px-4 bg-[#1E3A5F] hover:bg-[#162C48] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Tiếp tục tới {redirectUrl}
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Đăng xuất phiên hiện tại
                </button>
              </div>
            </div>
          ) : (
            <>
              {registeredSuccess && (
                <div className="mb-5">
                  <Alert variant="success" title="Đăng ký thành công">
                    Tài khoản của bạn đã được khởi tạo. Vui lòng đăng nhập để bắt đầu đặt vé!
                  </Alert>
                </div>
              )}

              {serverError && (
                <div className="mb-5">
                  <Alert variant="error" title="Đăng nhập thất bại">
                    {serverError}
                  </Alert>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Input
                  id="login-phone"
                  label="Số điện thoại"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  autoComplete="tel"
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                <Input
                  id="login-password"
                  label="Mật khẩu"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-brand hover:bg-brand-hover text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang xác thực...' : 'Đăng nhập'}</span>
                </button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-600">
                Chưa có tài khoản?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-action hover:underline transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          <Link to="/" className="text-brand hover:underline font-semibold">
            ← Về trang chủ tìm chuyến
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;

