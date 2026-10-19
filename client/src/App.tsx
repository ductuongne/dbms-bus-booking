import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ToastProvider from './components/common/Toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
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
import TripsPage from './pages/TripsPage';
import { AdminRoutesPage } from './pages/admin/AdminRoutesPage';
import { AdminStationsPage } from './pages/admin/AdminStationsPage';
import { AdminVehiclesPage } from './pages/admin/AdminVehiclesPage';
import { AdminVehicleTypesPage } from './pages/admin/AdminVehicleTypesPage';
import DriversPage from './pages/DriversPage';
import BookingPage from './pages/BookingPage';
import CustomersPage from './pages/CustomersPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Nhóm Khách Hàng (Customer Layout) */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Route>

            {/* Đăng nhập & Đăng ký công khai */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Phân hệ Tài xế (Bảo vệ bởi ProtectedRoute - DRIVER) */}
            <Route element={<ProtectedRoute allowedRoles={['DRIVER']} />}>
              <Route path="/driver/schedules" element={<DriverSchedulesPage />} />
            </Route>

            {/* Nhóm Quản Trị Hệ Thống (Bảo vệ bởi ProtectedRoute - ADMIN & STAFF) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/reports" replace />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="trips" element={<TripsPage />} />
              <Route path="routes" element={<AdminRoutesPage />} />
              <Route path="stations" element={<AdminStationsPage />} />
              <Route path="vehicles" element={<AdminVehiclesPage />} />
              <Route path="vehicle-types" element={<AdminVehicleTypesPage />} />
              <Route path="drivers" element={<DriversPage />} />
              <Route path="bookings" element={<BookingPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="users" element={<AdminDashboardPage />} />
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
