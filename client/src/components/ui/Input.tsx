import React from 'react'
import { AlertCircle } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string
	error?: string
	helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ label, error, helperText, id, className = '', disabled, ...props }, ref) => {
		const inputId = id || props.name || Math.random().toString(36).substring(2, 9)

		const baseInputClasses =
			'w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-all duration-150 outline-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed'

		const stateClasses = error
			? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/15 pr-10'
			: 'border-slate-300 hover:border-slate-400 focus:border-[#FF385C] focus:ring-4 focus:ring-red-500/15'

		return (
			<div className="w-full space-y-1.5 text-left">
				{label && (
					<label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
						{label}
					</label>
				)}

				<div className="relative">
					<input
						id={inputId}
						ref={ref}
						disabled={disabled}
						className={`${baseInputClasses} ${stateClasses} ${className}`}
						aria-invalid={Boolean(error)}
						aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-desc` : undefined}
						{...props}
					/>
					{error && (
						<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
							<AlertCircle className="w-4 h-4 text-red-500" />
						</div>
					)}
				</div>

				{error && (
					<p id={`${inputId}-error`} role="alert" className="text-xs font-medium text-red-600 animate-in fade-in duration-150">
						{error}
					</p>
				)}

				{!error && helperText && (
					<p id={`${inputId}-desc`} className="text-xs text-slate-500">
						{helperText}
					</p>
				)}
			</div>
		)
	}
)

Input.displayName = 'Input'

export default Input
