import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ToastProvider from './components/common/Toast';
import AuthProvider from './context/AuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';

import ReportsPage from './pages/ReportsPage';
import TripsPage from './pages/TripsPage';
import RoutesPage from './pages/RoutesPage';
import StationsPage from './pages/StationsPage';
import VehiclesPage from './pages/VehiclesPage';
import DriversPage from './pages/DriversPage';
import BookingPage from './pages/BookingPage';
import CustomersPage from './pages/CustomersPage';
import UsersPage from './pages/UsersPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Nhóm Khách Hàng */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/payment" element={<PaymentPage />} />
            </Route>

            {/* Đăng nhập công khai */}
            <Route path="/login" element={<LoginPage />} />

            {/* Nhóm Quản Trị (Bảo vệ bởi ProtectedRoute) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/reports" replace />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="trips" element={<TripsPage />} />
              <Route path="routes" element={<RoutesPage />} />
              <Route path="stations" element={<StationsPage />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="drivers" element={<DriversPage />} />
              <Route path="bookings" element={<BookingPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="users" element={<UsersPage />} />
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
