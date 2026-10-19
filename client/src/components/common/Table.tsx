import React from 'react';
import { Loader2 } from 'lucide-react';
import type { TableColumn } from '../../types';

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyText?: string;
  rowKey?: (item: T, index: number) => string;
}

export function Table<T>({
  columns,
  data,
  isLoading = false,
  emptyText = 'Không có dữ liệu hiển thị.',
  rowKey,
}: TableProps<T>): React.ReactElement {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left text-sm text-slate-700">
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

export default Table;

