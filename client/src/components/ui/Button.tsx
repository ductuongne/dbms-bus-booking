import React from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'action' | 'outline' | 'ghost'
	size?: 'sm' | 'md' | 'lg'
	isLoading?: boolean
	fullWidth?: boolean
}


export const Button: React.FC<ButtonProps> = ({
	children,
	variant = 'primary',
	size = 'md',
	isLoading = false,
	fullWidth = false,
	disabled,
	className = '',
	type = 'button',
	...props
}) => {
	const baseClasses =
		'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 select-none active:scale-[0.98]'

	const variantClasses = {
		primary:
			'bg-[#1E3A5F] hover:bg-[#162C48] text-white shadow-xs focus:ring-4 focus:ring-[#1E3A5F]/20 focus:outline-none',
		action:
			'bg-[#C2410C] hover:bg-[#9A3412] text-white shadow-xs focus:ring-4 focus:ring-[#C2410C]/20 focus:outline-none',
		outline:
			'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs focus:ring-4 focus:ring-slate-100 focus:outline-none',
		ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
	}[variant]


	const sizeClasses = {
		sm: 'text-xs px-3 py-1.5 gap-1.5',
		md: 'text-sm px-4 py-2.5 gap-2',
		lg: 'text-base px-5 py-3.5 gap-2.5',
	}[size]

	const widthClass = fullWidth ? 'w-full' : ''

	return (
		<button
			type={type}
			disabled={disabled || isLoading}
			className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`}
			{...props}
		>
			{isLoading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />}
			<span>{children}</span>
		</button>
	)
}

export default Button
