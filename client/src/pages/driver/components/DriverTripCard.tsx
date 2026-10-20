import React, { useState } from 'react'
import {
	Bus,
	Clock,
	Navigation,
	Users,
	CheckCircle2,
	Play,
	Flag,
	X,
	QrCode,
	AlertCircle,
	Loader2,
} from 'lucide-react'
import type { DriverScheduleDto, TripStatus } from '../../../types/driver'
import { driverService, type DriverPassengerDto } from '../../../services/driver.service'
import { useToast } from '../../../hooks/useToast'
import { Button } from '../../../components/common'

export interface DriverTripCardProps {
	trip?: DriverScheduleDto
	schedule?: DriverScheduleDto
	onTripUpdated?: () => void
}

export const DriverTripCard: React.FC<DriverTripCardProps> = ({
	trip,
	schedule,
	onTripUpdated,
}) => {
	const activeTrip = trip || schedule
	const { success, error: toastError } = useToast()

	const [isModalOpen, setIsModalOpen] = useState(false)
	const [passengers, setPassengers] = useState<DriverPassengerDto[]>([])
	const [isLoadingPassengers, setIsLoadingPassengers] = useState(false)
	const [checkInCode, setCheckInCode] = useState('')
	const [isCheckingIn, setIsCheckingIn] = useState(false)
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

	const formatDateTime = (dateStr: string) => {
		try {
			const d = new Date(dateStr)
			if (isNaN(d.getTime())) {
				return { time: '--:--', date: dateStr }
			}
			const time = d.toLocaleTimeString('vi-VN', {
				hour: '2-digit',
				minute: '2-digit',
			})
			const date = d.toLocaleDateString('vi-VN', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
			})
			return { time, date }
		} catch {
			return { time: '--:--', date: dateStr }
		}
	}

	if (!activeTrip) return null

	const dep = formatDateTime(activeTrip.departureTime)
	const arr = formatDateTime(activeTrip.arrivalTime)

	const statusConfig: Record<TripStatus, { label: string; className: string }> = {
		SCHEDULED: {
			label: 'Đã lên lịch',
			className: 'bg-blue-50 text-blue-700 border-blue-200',
		},
		DEPARTED: {
			label: 'Đang di chuyển',
			className: 'bg-amber-50 text-amber-700 border-amber-200',
		},
		COMPLETED: {
			label: 'Đã hoàn thành',
			className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
		},
		CANCELLED: {
			label: 'Đã hủy',
			className: 'bg-rose-50 text-rose-700 border-rose-200',
		},
	}

	const currentStatus = statusConfig[activeTrip.tripStatus] || {
		label: activeTrip.tripStatus,
		className: 'bg-slate-50 text-slate-700 border-slate-200',
	}

	// Mở danh sách hành khách
	const handleOpenManifest = async () => {
		setIsModalOpen(true)
		setIsLoadingPassengers(true)
		try {
			const data = await driverService.getTripPassengers(activeTrip.tripId)
			setPassengers(data)
		} catch (err: unknown) {
			toastError(err instanceof Error ? err.message : 'Không thể tải danh sách vé.')
		} finally {
			setIsLoadingPassengers(false)
		}
	}

	// Soát vé trực tiếp bằng mã vé
	const handleCheckInTicket = async (ticketCode: string) => {
		if (!ticketCode.trim()) return
		setIsCheckingIn(true)
		try {
			await driverService.checkInTicket(ticketCode.trim())
			success(`Hành khách có mã vé ${ticketCode.trim()} đã được xác nhận lên xe.`)
			setCheckInCode('')
			// Làm mới danh sách hành khách trong modal
			const updated = await driverService.getTripPassengers(activeTrip.tripId)
			setPassengers(updated)
			onTripUpdated?.()
		} catch (err: unknown) {
			toastError(err instanceof Error ? err.message : 'Lỗi khi soát vé.')
		} finally {
			setIsCheckingIn(false)
		}
	}

	// Đổi trạng thái chuyến xe (Khởi hành / Hoàn thành)
	const handleStatusTransition = async (newStatus: 'DEPARTED' | 'COMPLETED') => {
		setIsUpdatingStatus(true)
		try {
			await driverService.updateTripStatus(activeTrip.tripId, newStatus)
			success(`Chuyến xe ${activeTrip.tripId} đã chuyển sang trạng thái ${newStatus === 'DEPARTED' ? 'Đang di chuyển' : 'Đã hoàn thành'}.`)
			onTripUpdated?.()
		} catch (err: unknown) {
			toastError(err instanceof Error ? err.message : 'Lỗi thao tác trên chuyến đi.')
		} finally {
			setIsUpdatingStatus(false)
		}
	}

	const checkedCount = passengers.filter((p) => p.status === 'CHECKED_IN').length

	return (
		<>
			<div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-md space-y-4 text-left">
				{/* Header Thẻ: Mã chuyến + Trạng thái */}
				<div className="flex items-center justify-between pb-3 border-b border-slate-100">
					<div className="flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-[#FF385C] shrink-0">
							<Bus className="w-4 h-4" />
						</div>
						<div>
							<span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wider">
								{activeTrip.tripId}
							</span>
							<p className="text-[11px] text-slate-400">Tuyến #{activeTrip.routeId}</p>
						</div>
					</div>
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStatus.className}`}
					>
						{currentStatus.label}
					</span>
				</div>

				{/* Lộ trình: Dòng thời gian dọc */}
				<div className="space-y-3">
					<div className="flex items-start gap-3">
						<div className="flex flex-col items-center mt-1 shrink-0">
							<span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
							<span className="w-0.5 h-9 bg-slate-200 my-0.5" />
							<span className="w-2.5 h-2.5 rounded-full bg-[#FF385C] ring-4 ring-rose-100" />
						</div>

						<div className="flex-1 space-y-3">
							<div>
								<p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
									Điểm đón (Khởi hành)
								</p>
								<h4 className="text-sm font-bold text-slate-900 leading-snug">
									{activeTrip.departureStation}
								</h4>
								<p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
									<Clock className="w-3 h-3 text-slate-400" />
									<strong className="text-slate-800">{dep.time}</strong> — {dep.date}
								</p>
							</div>

							<div>
								<p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
									Điểm trả (Điểm đến)
								</p>
								<h4 className="text-sm font-bold text-slate-900 leading-snug">
									{activeTrip.arrivalStation}
								</h4>
								<p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
									<Clock className="w-3 h-3 text-slate-400" />
									<strong className="text-slate-800">{arr.time}</strong> — {arr.date}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Hành động của Tài xế: Soát vé & Điều khiển chuyến */}
				<div className="pt-2 flex flex-wrap gap-2 border-t border-slate-100">
					<Button
						variant="secondary"
						size="sm"
						icon={<Users className="w-3.5 h-3.5" />}
						onClick={handleOpenManifest}
					>
						Hành khách &amp; Soát vé
					</Button>

					{activeTrip.tripStatus === 'SCHEDULED' && (
						<Button
							variant="primary"
							size="sm"
							icon={<Play className="w-3.5 h-3.5" />}
							onClick={() => handleStatusTransition('DEPARTED')}
							disabled={isUpdatingStatus}
						>
							Khởi hành xe
						</Button>
					)}

					{activeTrip.tripStatus === 'DEPARTED' && (
						<Button
							variant="primary"
							size="sm"
							icon={<Flag className="w-3.5 h-3.5" />}
							onClick={() => handleStatusTransition('COMPLETED')}
							disabled={isUpdatingStatus}
						>
							Hoàn thành chuyến
						</Button>
					)}
				</div>

				{/* Footer Thẻ: Thông tin phương tiện */}
				<div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50/70 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl">
					<div className="flex items-center gap-1.5">
						<Navigation className="w-3.5 h-3.5 text-slate-400" />
						<span className="font-semibold text-slate-900">{activeTrip.licensePlate}</span>
						<span className="text-slate-400">({activeTrip.busType})</span>
					</div>
					<div className="text-slate-500 font-medium">
						{activeTrip.distanceKm} km • {activeTrip.totalSeats} chỗ
					</div>
				</div>
			</div>

			{/* Modal Bảng kê hành khách & Soát vé */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
					<div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
						{/* Modal Header */}
						<div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-base font-bold text-slate-900">
										Bảng kê hành khách — Chuyến {activeTrip.tripId}
									</h3>
									<span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
										{checkedCount}/{passengers.length} đã lên xe
									</span>
								</div>
								<p className="text-xs text-slate-500 mt-0.5">
									{activeTrip.departureStation} → {activeTrip.arrivalStation} ({dep.time}{' '}
									{dep.date})
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsModalOpen(false)}
								className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Quick Check-in Bar */}
						<div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
							<div className="relative flex-1">
								<QrCode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
								<input
									type="text"
									placeholder="Nhập mã vé để soát (VD: TCK10001)..."
									value={checkInCode}
									onChange={(e) => setCheckInCode(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											void handleCheckInTicket(checkInCode)
										}
									}}
									className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent bg-white"
								/>
							</div>
							<Button
								variant="primary"
								size="sm"
								onClick={() => handleCheckInTicket(checkInCode)}
								disabled={isCheckingIn || !checkInCode.trim()}
								icon={isCheckingIn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
							>
								Soát vé
							</Button>
						</div>

						{/* Danh sách hành khách */}
						<div className="flex-1 overflow-y-auto p-4 space-y-2">
							{isLoadingPassengers ? (
								<div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
									<Loader2 className="w-6 h-6 animate-spin text-[#1E3A5F]" />
									<span className="text-xs">Đang tải danh sách vé...</span>
								</div>
							) : passengers.length === 0 ? (
								<div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
									<AlertCircle className="w-8 h-8 text-slate-300" />
									<p className="text-xs text-slate-500 font-medium">Chưa có hành khách nào đặt vé trên chuyến xe này.</p>
								</div>
							) : (
								passengers.map((p) => {
									const isChecked = p.status === 'CHECKED_IN'
									return (
										<div
											key={p.ticketId}
											className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
												isChecked
													? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-900'
													: 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
											}`}
										>
											<div className="flex items-center gap-3">
												<span
													className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
														isChecked
															? 'bg-emerald-600 text-white'
															: 'bg-slate-100 text-slate-700'
													}`}
												>
													{p.seatNumber}
												</span>
												<div>
													<div className="flex items-center gap-2">
														<span className="text-sm font-bold text-slate-900">
															{p.passengerName}
														</span>
														<span className="text-[11px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
															{p.ticketCode}
														</span>
													</div>
													<p className="text-xs text-slate-500 mt-0.5">
														SĐT: {p.passengerPhone}
													</p>
												</div>
											</div>

											<div>
												{isChecked ? (
													<span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
														<CheckCircle2 className="w-3.5 h-3.5" />
														Đã lên xe
													</span>
												) : (
													<Button
														variant="outline"
														size="sm"
														icon={<CheckCircle2 className="w-3.5 h-3.5" />}
														onClick={() => handleCheckInTicket(p.ticketCode)}
														disabled={isCheckingIn}
													>
														Soát vé
													</Button>
												)}
											</div>
										</div>
									)
								})
							)}
						</div>

						{/* Modal Footer */}
						<div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
							<Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
								Đóng
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default DriverTripCard
