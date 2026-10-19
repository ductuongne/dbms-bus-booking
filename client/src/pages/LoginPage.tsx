import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Bus, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const { login, isLoading } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập email');
      return;
    }
    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      success('Đăng nhập thành công!');
      navigate(from, { replace: true });
    } else {
      setErrorMsg(result.message || 'Email hoặc mật khẩu không chính xác');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-2xl font-black text-[#1E3A5F] hover:opacity-90"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] flex items-center justify-center text-white shadow-xs">
              <Bus className="w-6 h-6" />
            </div>
            <span>
              Xe<span className="text-[#C2410C]">Viet</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 mt-4">Đăng nhập tài khoản</h2>
          <p className="text-xs text-slate-500 mt-1">
            Đăng nhập để đặt vé hoặc truy cập hệ thống quản trị XeViet
          </p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMsg && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium"
              >
                {errorMsg}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <Input
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              required
            />

            <div className="p-3 bg-blue-50/60 rounded-lg text-xs text-slate-600 border border-blue-100 flex flex-col gap-1">
              <span className="font-semibold text-slate-800">Tài khoản quản trị mẫu:</span>
              <span>Email: <code className="bg-white px-1 py-0.5 rounded border border-blue-200 text-[#1E3A5F]">admin@example.com</code></span>
              <span>Mật khẩu: <code className="bg-white px-1 py-0.5 rounded border border-blue-200 text-[#1E3A5F]">admin123</code></span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Đăng nhập
            </Button>
          </form>
        </Card>

        <div className="text-center mt-6 text-xs text-slate-500">
          <Link to="/" className="text-[#1E3A5F] hover:underline font-semibold">
            ← Về trang chủ tìm chuyến
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
