import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav
      aria-label="Điều hướng phân trang"
      className={`flex items-center justify-between sm:justify-end gap-2 text-sm ${className}`}
    >
      <span className="text-xs text-slate-500 mr-2">
        Trang {currentPage} / {totalPages}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Trang trước"
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {startPage > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
            >
              1
            </button>
            {startPage > 2 && <span className="px-1 text-slate-400 text-xs">...</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={`w-8 h-8 rounded-lg text-xs font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] ${
              p === currentPage
                ? 'bg-[#1E3A5F] text-white'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1 text-slate-400 text-xs">...</span>}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Trang sau"
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;

