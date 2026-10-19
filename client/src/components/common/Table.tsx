import React from 'react';
import { Loader2 } from 'lucide-react';
import type { TableColumn } from '../../types';

export interface TableProps<T = Record<string, unknown>> extends React.TableHTMLAttributes<HTMLTableElement> {
  columns?: TableColumn<T>[];
  data?: T[];
  isLoading?: boolean;
  emptyText?: string;
  rowKey?: (item: T, index: number) => string;
  children?: React.ReactNode;
}

export function Table<T = Record<string, unknown>>({
  columns,
  data,
  isLoading = false,
  emptyText = 'Không có dữ liệu hiển thị.',
  rowKey,
  children,
  className = '',
  ...rest
}: TableProps<T>): React.ReactElement {
  // If compound children are provided without columns config:
  if (!columns || !data) {
    return (
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className={`w-full text-left text-sm text-slate-700 ${className}`} {...rest}>
          {children}
        </table>
      </div>
    );
  }

  // Data-driven rendering when columns & data are provided:
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className={`w-full text-left text-sm text-slate-700 ${className}`} {...rest}>
        <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase text-slate-500">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className="px-4 py-3.5 whitespace-nowrap"
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-slate-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1E3A5F]" />
                  <span className="text-xs">Đang tải dữ liệu...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-10 text-center text-sm text-slate-500">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const key = rowKey ? rowKey(item, index) : (item as { id?: string }).id || String(index);
              return (
                <tr
                  key={key}
                  className="transition-colors hover:bg-slate-50/80 focus-within:bg-slate-50/80"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 align-middle">
                      {col.render
                        ? col.render(item, index)
                        : (item as Record<string, unknown>)[col.key] !== undefined
                        ? String((item as Record<string, unknown>)[col.key])
                        : null}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Compound Table Sub-components (for manual declarative table construction)
// ============================================================================

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  ...props
}) => (
  <thead
    className={`border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`}
    {...props}
  />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  ...props
}) => <tbody className={`divide-y divide-slate-100 ${className}`} {...props} />;

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className = '',
  ...props
}) => (
  <tr className={`transition-colors hover:bg-slate-50/70 ${className}`} {...props} />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className = '',
  ...props
}) => (
  <th
    className={`px-4 py-3.5 font-semibold text-slate-700 whitespace-nowrap ${className}`}
    {...props}
  />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className = '',
  ...props
}) => <td className={`px-4 py-3.5 align-middle ${className}`} {...props} />;

export default Table;
