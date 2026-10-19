import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { RefreshCw, CalendarX, Loader2, UserCheck } from 'lucide-react'
import { AxiosError } from 'axios'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../lib/api'
import type { DriverScheduleDto } from '../../types/driver'
import type { ApiErrorResponse } from '../../types/auth'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { DriverTripCard } from './components/DriverTripCard'

export const DriverSchedulesPage: React.FC = () => {
	const { user } = useAuth()
	const [schedules, setSchedules] = useState<DriverScheduleDto[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [filterStatus, setFilterStatus] = useState<string>('ALL')

	// Tải dữ liệu lịch trình khi mount (kèm ignore flag dọn dẹp chuẩn React 19)
	useEffect(() => {
		let ignore = false

		const fetchSchedules = async () => {
			try {
				const res = await api.get('/private/driver/schedules')
				if (!ignore) {
					setSchedules(res.data.data || [])
				}
			} catch (err: unknown) {
				if (!ignore) {
					if (err instanceof AxiosError && err.response?.data) {
						const apiErr = err.response.data as ApiErrorResponse
						setError(
							apiErr.message || 'Không thể nạp lịch phân công tài xế.'
						)
					} else {
						setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.')
					}
				}
			} finally {
				if (!ignore) {
					setIsLoading(false)
				}
			}
		}

		void fetchSchedules()

		return () => {
			ignore = true
		}
	}, [])

	// Thao tác làm mới thủ công
	const handleRefresh = useCallback(async () => {
		setIsLoading(true)
		setError(null)
		try {
			const res = await api.get('/private/driver/schedules')
			setSchedules(res.data.data || [])
		} catch (err: unknown) {
			if (err instanceof AxiosError && err.response?.data) {
				const apiErr = err.response.data as ApiErrorResponse
				setError(apiErr.message || 'Không thể tải lịch trình mới.')
			} else {
				setError('Lỗi kết nối mạng. Vui lòng kiểm tra lại.')
			}
		} finally {
			setIsLoading(false)
		}
	}, [])

	// Lọc danh sách theo trạng thái chuyến xe
	const filteredSchedules = useMemo(() => {
		if (filterStatus === 'ALL') return schedules
		return schedules.filter((s) => s.tripStatus === filterStatus)
	}, [schedules, filterStatus])

	return (
		<div className="min-h-[calc(100vh-4rem)] bg-slate-50/80 px-4 py-6 sm:py-8">
			<div className="mx-auto max-w-2xl space-y-5">
				{/* Top Bar Header */}
				<div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
					<div className="flex items-center gap-3 text-left">
						<div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
							<UserCheck className="w-5 h-5" />
						</div>
						<div>
							<h1 className="text-base font-bold text-slate-900 leading-tight">
								Lịch trình phân công
							</h1>
							<p className="text-xs text-slate-500">
								Tài xế:{' '}
								<strong className="text-slate-800">
									{user?.fullName || user?.userId}
								</strong>
							</p>
						</div>
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						disabled={isLoading}
						className="cursor-pointer"
					>
						<RefreshCw
							className={`w-3.5 h-3.5 mr-1 inline-block ${
								isLoading ? 'animate-spin' : ''
							}`}
						/>
						<span className="text-xs">Làm mới</span>
					</Button>
				</div>

				{error && (
					<Alert variant="error" title="Lỗi hệ thống">
						{error}
					</Alert>
				)}

				{/* Filter Pills */}
				<div className="flex items-center gap-2 overflow-x-auto pb-1">
					{[
						{ id: 'ALL', label: 'Tất cả' },
						{ id: 'SCHEDULED', label: 'Sắp chạy' },
						{ id: 'DEPARTED', label: 'Đang chạy' },
						{ id: 'COMPLETED', label: 'Đã xong' },
					].map((tab) => {
						const isActive = filterStatus === tab.id
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setFilterStatus(tab.id)}
								className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
									isActive
										? 'bg-slate-900 text-white shadow-xs'
										: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
								}`}
							>
								{tab.label}
							</button>
						)
					})}
				</div>

				{/* Danh sách thẻ ca chạy */}
				{isLoading ? (
					<div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center">
						<Loader2 className="w-8 h-8 animate-spin text-[#FF385C]" />
						<p className="mt-3 text-sm font-medium text-slate-500">
							Đang đồng bộ lịch trình ca chạy từ máy chủ...
						</p>
					</div>
				) : filteredSchedules.length === 0 ? (
					<div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-3">
						<CalendarX className="w-12 h-12 text-slate-300" />
						<div>
							<h4 className="text-base font-bold text-slate-800">
								Không có lịch chạy nào
							</h4>
							<p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
								{filterStatus === 'ALL'
									? 'Hiện tại bạn chưa được phân công ca trực nào. Hãy liên hệ bộ phận điều hành nếu cần hỗ trợ.'
									: 'Không tìm thấy chuyến đi nào ở trạng thái này.'}
							</p>
						</div>
						<Button variant="outline" size="sm" onClick={handleRefresh}>
							Kiểm tra lại
						</Button>
					</div>
				) : (
					<div className="space-y-4">
						{filteredSchedules.map((trip) => (
							<DriverTripCard key={trip.tripId} trip={trip} />
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export default DriverSchedulesPage
