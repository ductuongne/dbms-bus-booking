import React from 'react';
import { Bus, ShieldCheck, Clock, Headphones } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto text-gray-600 text-sm">
      {/* Value propositions banner */}
      <div className="bg-gray-50 border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-[#FF385C]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">An toàn & Đáng tin cậy</h4>
              <p className="text-xs text-gray-500">Đối tác xe limousine được kiểm định chất lượng nghiêm ngặt</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-[#FF385C]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Giữ chỗ tức thì</h4>
              <p className="text-xs text-gray-500">Chọn vị trí ngồi chính xác theo sơ đồ xe trong thời gian thực</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-[#FF385C]">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Hỗ trợ 24/7</h4>
              <p className="text-xs text-gray-500">Đội ngũ CSKH hỗ trợ đổi trả vé và giải đáp thắc mắc liên tục</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FF385C] flex items-center justify-center text-white">
                <Bus className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-[#FF385C]">red<span className="text-gray-900">Bus</span></span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Nền tảng đặt vé xe khách và xe Limousine trực tuyến hàng đầu Việt Nam. Kết nối hành khách với các nhà xe uy tín nhất.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider">Tuyến đường phổ biến</h5>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-[#FF385C] cursor-pointer">Hà Nội → Ninh Bình</span></li>
              <li><span className="hover:text-[#FF385C] cursor-pointer">Hà Nội → Hạ Long</span></li>
              <li><span className="hover:text-[#FF385C] cursor-pointer">TP. Hồ Chí Minh → Đà Lạt</span></li>
              <li><span className="hover:text-[#FF385C] cursor-pointer">Đà Nẵng → Hội An</span></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider">Nhà xe đối tác</h5>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-[#FF385C] cursor-pointer">Hoa Lư Limousine</span></li>
              <li><span className="hover:text-[#FF385C] cursor-pointer">X.E Việt Nam</span></li>
              <li><span className="hover:text-[#FF385C] cursor-pointer">Tràng An Limousine</span></li>
              <li><span className="hover:text-[#FF385C] cursor-pointer">Phương Trang (FUTA Bus)</span></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider">Hỗ trợ & Thanh toán</h5>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-[#FF385C] cursor-pointer">Hướng dẫn đặt vé</span></li>
              <li><span className="hover:text-[#FF385C] cursor-pointer">Chính sách hủy & đổi vé</span></li>
              <li><span className="hover:text-[#FF385C] cursor-pointer">Thanh toán qua VietQR</span></li>
              <li><span className="hover:text-[#FF385C] cursor-pointer">Bảo mật thông tin khách hàng</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
          <p>© 2026 redBus Vietnam. Dự án Client-side Bus Ticket Booking App.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="hover:text-gray-600 cursor-pointer">Điều khoản sử dụng</span>
            <span className="hover:text-gray-600 cursor-pointer">Chính sách quyền riêng tư</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
