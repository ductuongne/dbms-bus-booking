import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { Bus, UserPlus } from 'lucide-react';
import { Button, Input, Alert } from '../components/common';
import { BRAND_INFO } from '../constants';
import { authService } from '../services/auth.service';

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ và tên không được quá 100 ký tự'),
    phone: z
      .string()
      .regex(
        /^(0[3|5|7|8|9])+([0-9]{8})$/,
        'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09)'
      ),
    email: z.string().email('Email không hợp lệ'),
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .max(50, 'Mật khẩu không được quá 50 ký tự'),
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
      await authService.register({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        password: data.password,
      });

      // Chuyển hướng sang màn hình đăng nhập với cờ thành công
      navigate('/login', {
        replace: true,
        state: { registeredSuccess: true },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
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
            Tạo tài khoản mới
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Trải nghiệm dịch vụ đặt vé xe tiện lợi và nhận ưu đãi
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
          {serverError && (
            <div className="mb-6">
              <Alert variant="error" title="Lỗi đăng ký">
                {serverError}
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              disabled={isSubmitting}
              error={errors.fullName?.message}
              {...register('fullName')}
            />

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
              label="Địa chỉ Email"
              placeholder="example@domain.com"
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Mật khẩu"
              placeholder="••••••••"
              type="password"
              autoComplete="new-password"
              disabled={isSubmitting}
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Xác nhận mật khẩu"
              placeholder="••••••••"
              type="password"
              autoComplete="new-password"
              disabled={isSubmitting}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              variant="action"
              size="lg"
              fullWidth
              loading={isSubmitting}
              icon={<UserPlus className="w-4 h-4" />}
              className="mt-2"
            >
              Đăng ký tài khoản
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="text-brand font-bold hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
