import React from 'react'

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
	className = '',
	...props
}) => (
	<div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
		<table
			className={`w-full text-left text-sm text-slate-700 ${className}`}
			{...props}
		/>
	</div>
)

export const TableHeader: React.FC<
	React.HTMLAttributes<HTMLTableSectionElement>
> = ({ className = '', ...props }) => (
	<thead
		className={`border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`}
		{...props}
	/>
)

export const TableBody: React.FC<
	React.HTMLAttributes<HTMLTableSectionElement>
> = ({ className = '', ...props }) => (
	<tbody className={`divide-y divide-slate-100 ${className}`} {...props} />
)

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
	className = '',
	...props
}) => (
	<tr
		className={`transition-colors hover:bg-slate-50/70 ${className}`}
		{...props}
	/>
)

export const TableHead: React.FC<
	React.ThHTMLAttributes<HTMLTableCellElement>
> = ({ className = '', ...props }) => (
	<th
		className={`px-4 py-3.5 font-semibold text-slate-700 whitespace-nowrap ${className}`}
		{...props}
	/>
)

export const TableCell: React.FC<
	React.TdHTMLAttributes<HTMLTableCellElement>
> = ({ className = '', ...props }) => (
	<td className={`px-4 py-3.5 align-middle ${className}`} {...props} />
)

export default Table
