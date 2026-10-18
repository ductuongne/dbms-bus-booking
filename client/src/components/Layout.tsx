import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export const Layout: React.FC = () => {
  const location = useLocation();
  const isPaymentPage = location.pathname.startsWith('/payment');

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD] text-gray-900 selection:bg-rose-100 selection:text-[#FF385C]">
      {/* Header chuẩn chỉ hiển thị ở các trang thường, trang Payment có header riêng với countdown timer */}
      {!isPaymentPage && <Header />}

      {/* Main Content Rendered by React Router */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer chỉ hiển thị ở các trang thường */}
      {!isPaymentPage && <Footer />}
    </div>
  );
};

export default Layout;
