import React from 'react'
import { Bus, Clock, Navigation } from 'lucide-react'
import type { DriverScheduleDto, TripStatus } from '../../../types/driver'

export interface DriverTripCardProps {
	trip: DriverScheduleDto
}

export const DriverTripCard: React.FC<DriverTripCardProps> = ({ trip }) => {
	// Định dạng giờ và ngày từ chuỗi thời gian ISO
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

	const dep = formatDateTime(trip.departureTime)
	const arr = formatDateTime(trip.arrivalTime)

	// Cấu hình Badge trạng thái chuyến đi
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

	const currentStatus = statusConfig[trip.tripStatus] || {
		label: trip.tripStatus,
		className: 'bg-slate-50 text-slate-700 border-slate-200',
	}

	return (
		<div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-md space-y-4 text-left">
			{/* Header Thẻ: Mã chuyến + Trạng thái */}
			<div className="flex items-center justify-between pb-3 border-b border-slate-100">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-[#FF385C] shrink-0">
						<Bus className="w-4 h-4" />
					</div>
					<div>
						<span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wider">
							{trip.tripId}
						</span>
						<p className="text-[11px] text-slate-400">Tuyến #{trip.routeId}</p>
					</div>
				</div>
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStatus.className}`}
				>
					{currentStatus.label}
				</span>
			</div>

			{/* Lộ trình: Dòng thời gian dọc (Vertical Timeline) */}
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
								{trip.departureStation}
							</h4>
							<p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
								<Clock className="w-3 h-3 text-slate-400" />
								<strong className="text-slate-800">{dep.time}</strong> —{' '}
								{dep.date}
							</p>
						</div>

						<div>
							<p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
								Điểm trả (Điểm đến)
							</p>
							<h4 className="text-sm font-bold text-slate-900 leading-snug">
								{trip.arrivalStation}
							</h4>
							<p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
								<Clock className="w-3 h-3 text-slate-400" />
								<strong className="text-slate-800">{arr.time}</strong> —{' '}
								{arr.date}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Footer Thẻ: Thông tin phương tiện */}
			<div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50/70 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl">
				<div className="flex items-center gap-1.5">
					<Navigation className="w-3.5 h-3.5 text-slate-400" />
					<span className="font-semibold text-slate-900">
						{trip.licensePlate}
					</span>
					<span className="text-slate-400">({trip.busType})</span>
				</div>
				<div className="text-slate-500 font-medium">
					{trip.distanceKm} km • {trip.totalSeats} chỗ
				</div>
			</div>
		</div>
	)
}

export default DriverTripCard
