import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Bus, LogIn } from 'lucide-react';
import { z } from 'zod';
import { Input, Alert } from '../components/common';
import { BRAND_INFO } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';

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
      ? '/driver/schedules'
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
      const authResult = await authService.login(data);
      login(authResult.token, authResult.user, authResult.refreshToken);

      const targetUrl =
        locationState?.from?.pathname ||
        (authResult.user.role === 'ADMIN' || authResult.user.role === 'STAFF'
          ? '/admin'
          : authResult.user.role === 'DRIVER'
          ? '/driver/schedules'
          : '/');

      navigate(targetUrl, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
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
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Đăng nhập hệ thống
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Nhập số điện thoại và mật khẩu để tiếp tục
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
          {isAuthenticated && user && (
            <div className="mb-6">
              <Alert variant="info" title="Bạn đang đăng nhập">
                Đang đăng nhập với tài khoản{' '}
                <strong>{user.fullName || user.phone}</strong> ({user.role}).{' '}
                <div className="mt-2 flex gap-3">
                  <Link
                    to={redirectUrl}
                    className="font-semibold underline hover:text-blue-900"
                  >
                    Tiếp tục vào trang
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="font-semibold text-red-600 underline hover:text-red-800"
                  >
                    Đăng xuất
                  </button>
                </div>
              </Alert>
            </div>
          )}

          {registeredSuccess && (
            <div className="mb-6">
              <Alert variant="success" title="Đăng ký thành công">
                Tài khoản của bạn đã được khởi tạo. Vui lòng đăng nhập để bắt đầu!
              </Alert>
            </div>
          )}

          {serverError && (
            <div className="mb-6">
              <Alert variant="error" title="Lỗi đăng nhập">
                {serverError}
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Số điện thoại"
              placeholder="0912345678"
              type="tel"
              autoComplete="tel"
              disabled={isSubmitting}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Mật khẩu"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-brand focus:ring-brand w-3.5 h-3.5"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-brand hover:underline font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-action hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-3 px-4 shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="text-brand font-bold hover:underline"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
