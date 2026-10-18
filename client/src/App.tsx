import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import PaymentPage from './pages/PaymentPage';
import RoutesPage from './pages/RoutesPage';
import AdminLayout from './components/AdminLayout';
import AdminVehiclesPage from './pages/admin/AdminVehiclesPage';
import AdminVehicleTypesPage from './pages/admin/AdminVehicleTypesPage';
import AdminSeatLayoutPage from './pages/admin/AdminSeatLayoutPage';
import AdminRoutesPage from './pages/admin/AdminRoutesPage';
import AdminStationsPage from './pages/admin/AdminStationsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public User Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/routes" element={<RoutesPage />} />

          {/* Admin Fleet, Route & Station Management Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/vehicles" replace />} />
            <Route path="vehicles" element={<AdminVehiclesPage />} />
            <Route path="vehicle-types" element={<AdminVehicleTypesPage />} />
            <Route path="seat-layout" element={<AdminSeatLayoutPage />} />
            <Route path="routes" element={<AdminRoutesPage />} />
            <Route path="stations" element={<AdminStationsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
