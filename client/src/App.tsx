import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ToastProvider from './components/common/Toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import DriverLayout from './components/DriverLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import PaymentPage from './pages/PaymentPage';
import RoutesPage from './pages/RoutesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Driver portal
import { DriverSchedulesPage } from './pages/driver/DriverSchedulesPage';

// Admin pages
import ReportsPage from './pages/ReportsPage';
import { AdminTripsPage } from './pages/admin/AdminTripsPage';
import { AdminRoutesPage } from './pages/admin/AdminRoutesPage';
import { AdminStationsPage } from './pages/admin/AdminStationsPage';
import { AdminVehiclesPage } from './pages/admin/AdminVehiclesPage';
import { AdminVehicleTypesPage } from './pages/admin/AdminVehicleTypesPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';




import { useAuth } from './hooks/useAuth';

const AdminIndexRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/reports" replace />;
  }
  if (user?.role === 'STAFF') {
    return <Navigate to="/admin/trips" replace />;
  }
  return <Navigate to="/" replace />;
};

import TicketLookupPage from './pages/TicketLookupPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Phân hệ Khách hàng (Customer Layout) */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/tra-cuu-ve" element={<TicketLookupPage />} />
              <Route path="/lookup" element={<TicketLookupPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Route>

            {/* Xác thực người dùng (Auth) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Phân hệ Tài xế (Driver Portal - Yêu cầu role DRIVER) */}
            <Route
              path="/driver"
              element={
                <ProtectedRoute allowedRoles={['DRIVER']}>
                  <DriverLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/driver/schedules" replace />} />
              <Route path="schedules" element={<DriverSchedulesPage />} />
              <Route path="schedule" element={<Navigate to="/driver/schedules" replace />} />
            </Route>

            {/* Phân hệ Quản trị hệ thống (Admin Portal - Yêu cầu role ADMIN & STAFF) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminIndexRedirect />} />
              {/* Báo cáo tài chính (Yêu cầu riêng quyền ADMIN) */}
              <Route
                path="reports"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="trips" element={<AdminTripsPage />} />
              <Route path="routes" element={<AdminRoutesPage />} />
              <Route path="stations" element={<AdminStationsPage />} />
              <Route path="vehicles" element={<AdminVehiclesPage />} />
              <Route path="vehicle-types" element={<AdminVehicleTypesPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              {/* Legacy route redirects */}
              <Route path="drivers" element={<Navigate to="/admin/users" replace />} />
              <Route path="customers" element={<Navigate to="/admin/users" replace />} />

              {/* Quản lý tài khoản: Chỉ ADMIN có quyền */}

              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
            </Route>


            {/* Điều hướng mặc định */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
