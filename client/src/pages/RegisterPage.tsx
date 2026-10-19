import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { z } from 'zod';
import { Bus, UserPlus } from 'lucide-react';
import { api } from '../lib/api';
import type { ApiErrorResponse } from '../types/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { BRAND_INFO } from '../constants';

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ và tên không được vượt quá 100 ký tự')
      .trim(),
    phone: z
      .string()
      .regex(
        /^(0[3|5|7|8|9])+([0-9]{8})$/,
        'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)'
      ),
    email: z
      .string()
      .email('Địa chỉ email không đúng định dạng')
      .toLowerCase()
      .trim(),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError(null);
      const payload = {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        password: data.password,
      };

      // Thử endpoint chuẩn /public/register, fallback /public/auth/register nếu cần
      try {
        await api.post('/public/register', payload);
      } catch (postErr) {
        if (
          postErr instanceof AxiosError &&
          postErr.response?.status === 404
        ) {
          await api.post('/public/auth/register', payload);
        } else {
          throw postErr;
        }
      }

      // Chuyển hướng sang màn hình đăng nhập với thông báo thành công
      navigate('/login', {
        replace: true,
        state: { registeredSuccess: true },
      });
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data) {
        const apiErr = err.response.data as ApiErrorResponse;
        setServerError(
          apiErr.message ||
            'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.'
        );
      } else {
        setServerError(
          'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'
        );
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
          <h1 className="text-xl font-bold text-slate-900 mt-4">Tạo tài khoản mới</h1>
          <p className="text-xs text-slate-500 mt-1">
            Đăng ký tài khoản {BRAND_INFO.name} để quản lý vé và lịch trình di chuyển thuận tiện
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          {serverError && (
            <div className="mb-5">
              <Alert variant="error" title="Đăng ký thất bại">
                {serverError}
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              id="register-fullName"
              label="Họ và tên"
              placeholder="Ví dụ: Nguyễn Văn An"
              autoComplete="name"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              id="register-phone"
              label="Số điện thoại"
              type="tel"
              placeholder="Ví dụ: 0912345678"
              autoComplete="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              id="register-email"
              label="Địa chỉ Email"
              type="email"
              placeholder="vidu@gmail.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="register-password"
              label="Mật khẩu"
              type="password"
              placeholder="Tối thiểu 8 ký tự"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              id="register-confirmPassword"
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isSubmitting}
                className="cursor-pointer"
              >
                <UserPlus className="w-4 h-4 mr-1.5 inline-block" />
                <span>Đăng ký tài khoản</span>
              </Button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-600">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="font-semibold text-action hover:underline transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6 text-xs text-slate-500">
          <Link to="/" className="text-brand hover:underline font-semibold">
            ← Về trang chủ tìm chuyến
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
