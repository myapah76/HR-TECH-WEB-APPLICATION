import React from 'react'
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
  pageSizeOptions?: number[]
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [5, 10, 20, 50],
}: PaginationProps) => {
  if (totalItems <= 10) return null

  // Calculate 5 page numbers (1 active current page + up to 4 neighboring pages)
  let startPage = Math.max(1, currentPage - 2)
  const endPage = Math.min(totalPages, startPage + 4)

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4)
  }

  const pageNumbers: number[] = []
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-2 border-t border-slate-100 shrink-0 select-none">
      {/* Items per page selector & status text */}
      <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
        <div className="flex items-center gap-2">
          <span>Hiển thị</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              onItemsPerPageChange(Number(e.target.value))
              onPageChange(1)
            }}
            className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-bold focus:outline-hidden focus:border-emerald-500 transition-all cursor-pointer"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>dòng/trang</span>
        </div>

        <span className="hidden sm:inline text-slate-300">|</span>

        <span>
          Hiển thị {startItem} - {endItem} trên tổng số {totalItems}
        </span>
      </div>

      {/* Pagination control buttons (Max 9 buttons total) */}
      <div className="flex items-center gap-1">
        {/* 1. First Page (<<) */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="Trang đầu"
          className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* 2. Prev Page (<) */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          title="Trang trước"
          className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* 3. Page Numbers (1 current + up to 4 neighbors) */}
        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`w-8.5 h-8.5 rounded-xl text-xs font-bold transition-all ${
                currentPage === page
                  ? 'bg-emerald-600 text-white shadow-xs scale-105 shadow-emerald-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* 4. Next Page (>) */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          title="Trang sau"
          className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* 5. Last Page (>>) */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Trang cuối"
          className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default React.memo(Pagination)
