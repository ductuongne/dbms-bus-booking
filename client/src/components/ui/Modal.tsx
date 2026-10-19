import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title: string
	description?: string
	children: React.ReactNode
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	description,
	children,
	maxWidth = 'md',
}) => {
	// Đóng modal khi nhấn phím Escape
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose()
			}
		}

		if (isOpen) {
			window.addEventListener('keydown', handleKeyDown)
		}

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	const maxWidthClass = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
	}[maxWidth]

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
		>
			{/* Backdrop overlay */}
			<div
				className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* Modal content surface */}
			<div
				className={`relative w-full ${maxWidthClass} rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/80 z-10 space-y-4 animate-in zoom-in-95 duration-150`}
			>
				<div className="flex items-center justify-between border-b border-slate-100 pb-3">
					<div>
						<h3 className="text-lg font-bold text-slate-900">{title}</h3>
						{description && (
							<p className="text-xs text-slate-500 mt-0.5">{description}</p>
						)}
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Đóng hộp thoại"
						className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="mt-2">{children}</div>
			</div>
		</div>
	)
}

export default Modal
