import React from 'react';
import { Bus } from 'lucide-react';
import { BRAND_INFO } from '../constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center text-white">
                <Bus className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-[#1E3A5F]">
                Daisy <span className="text-[#C2410C]">Booking</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              {BRAND_INFO.slogan}
            </p>
            <p className="text-xs text-slate-500">
              Email: {BRAND_INFO.email}
            </p>
            <p className="text-xs text-slate-500">
              Địa chỉ: {BRAND_INFO.address}
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Tuyến đường phổ biến
            </h5>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-[#1E3A5F] cursor-pointer">Hà Nội → Ninh Bình</span></li>
              <li><span className="hover:text-[#1E3A5F] cursor-pointer">Hà Nội → Hải Phòng</span></li>
              <li><span className="hover:text-[#1E3A5F] cursor-pointer">TP. Hồ Chí Minh → Đà Lạt</span></li>
              <li><span className="hover:text-[#1E3A5F] cursor-pointer">Đà Nẵng → Hội An</span></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Chính sách & Quy định
            </h5>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-[#1E3A5F] cursor-pointer">Hướng dẫn đặt vé</span></li>
              <li><span className="hover:text-[#1E3A5F] cursor-pointer">Chính sách hủy & đổi vé</span></li>
              <li><span className="hover:text-[#1E3A5F] cursor-pointer">Quy chế hoạt động</span></li>
              <li><span className="hover:text-[#1E3A5F] cursor-pointer">Bảo mật thông tin khách hàng</span></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Thanh toán tiện lợi
            </h5>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-[#1E3A5F] cursor-pointer">Quét mã QR VietQR tự động</span></li>
              <li><span className="hover:text-[#1E3A5F] cursor-pointer">Chuyển khoản liên ngân hàng</span></li>
              <li><span className="hover:text-[#1E3A5F] cursor-pointer">Thanh toán tiền mặt tại nhà xe</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 {BRAND_INFO.name}. Nền tảng đặt vé xe khách và Limousine trực tuyến.</p>
          <div className="flex gap-4 mt-3 md:mt-0">
            <span className="hover:text-slate-600 cursor-pointer">Điều khoản dịch vụ</span>
            <span className="hover:text-slate-600 cursor-pointer">Chính sách bảo mật</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
