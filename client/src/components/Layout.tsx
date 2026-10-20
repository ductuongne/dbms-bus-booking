import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export const Layout: React.FC = () => {
  const location = useLocation();
  const isPaymentPage = location.pathname.startsWith('/payment');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {!isPaymentPage && <Header />}

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {!isPaymentPage && <Footer />}
    </div>
  );
};

export default Layout;
