import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import HomePage from '../pages/HomePage'
import SearchResultsPage from '../pages/SearchResultsPage'
import PaymentPage from '../pages/PaymentPage'
import { LoginPage } from '../pages/LoginPage'
import { AdminDashboardPage } from '../pages/AdminDashboardPage'
import { UnauthorizedPage } from '../pages/UnauthorizedPage'
import { ProtectedRoute } from '../components/ProtectedRoute'

export const AppRoutes: React.FC = () => {
	return (
		<Routes>
			{/* Public Layout */}
			<Route element={<Layout />}>
				<Route path="/" element={<HomePage />} />
				<Route path="/search" element={<SearchResultsPage />} />
				<Route path="/payment" element={<PaymentPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/unauthorized" element={<UnauthorizedPage />} />

				{/* Admin Protected Routes: Chỉ cho phép role ADMIN */}
				<Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
					<Route path="/admin" element={<AdminDashboardPage />} />
				</Route>

				{/* Fallback Catch-all Route */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Route>
		</Routes>
	)
}

export default AppRoutes
