import React from 'react'
import type { UserRole } from '../../types/auth'

export interface BadgeProps {
	variant?: 'role' | 'status' | 'default'
	role?: UserRole
	isActive?: boolean
	children?: React.ReactNode
	className?: string
}

export const Badge: React.FC<BadgeProps> = ({
	variant = 'default',
	role,
	isActive,
	children,
	className = '',
}) => {
	let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200'

	if (variant === 'role' && role) {
		colorClasses = {
			ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
			STAFF: 'bg-blue-50 text-blue-700 border-blue-200',
			DRIVER: 'bg-amber-50 text-amber-700 border-amber-200',
			CUSTOMER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
		}[role]
	} else if (variant === 'status' && typeof isActive === 'boolean') {
		colorClasses = isActive
			? 'bg-emerald-50 text-emerald-700 border-emerald-200'
			: 'bg-rose-50 text-rose-700 border-rose-200'
	}

	return (
		<span
			className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses} ${className}`}
		>
			{variant === 'status' && (
				<span
					className={`w-1.5 h-1.5 rounded-full ${
						isActive ? 'bg-emerald-500' : 'bg-rose-500'
					}`}
				/>
			)}
			<span>
				{children ||
					(variant === 'status'
						? isActive
							? 'Hoạt động'
							: 'Đã khóa'
						: role)}
			</span>
		</span>
	)
}

export default Badge
