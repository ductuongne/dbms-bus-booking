import React from 'react'
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'

export interface AlertProps {
	variant?: 'error' | 'success' | 'warning' | 'info'
	title?: string
	children: React.ReactNode
	className?: string
}

export const Alert: React.FC<AlertProps> = ({
	variant = 'error',
	title,
	children,
	className = '',
}) => {
	const config = {
		error: {
			container: 'bg-red-50 border-red-200 text-red-900',
			icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
		},
		success: {
			container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
			icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
		},
		warning: {
			container: 'bg-amber-50 border-amber-200 text-amber-900',
			icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
		},
		info: {
			container: 'bg-blue-50 border-blue-200 text-blue-900',
			icon: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
		},
	}[variant]

	return (
		<div
			className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${config.container} ${className}`}
			role="alert"
		>
			{config.icon}
			<div className="flex-1 space-y-0.5 text-left">
				{title && <h5 className="font-semibold text-sm leading-tight">{title}</h5>}
				<div className="text-xs leading-relaxed">{children}</div>
			</div>
		</div>
	)
}

export default Alert
