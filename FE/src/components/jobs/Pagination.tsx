'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const handlePrev = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const renderPages = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            pages.push(2);
            pages.push(3);
            pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2.5 mt-10 select-none">
            {/* Previous Page Button */}
            <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer shadow-2xs"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page Numbers */}
            {renderPages().map((page, index) => {
                if (page === '...') {
                    return (
                        <span key={`dots-${index}`} className="text-slate-400 font-extrabold px-1 text-sm">
                            ...
                        </span>
                    );
                }

                const pageNum = page as number;
                const isActive = currentPage === pageNum;

                return (
                    <button
                        key={`page-${pageNum}`}
                        onClick={() => onPageChange(pageNum)}
                        className={`h-9 w-9 flex items-center justify-center rounded-lg text-sm font-extrabold transition-all cursor-pointer ${isActive
                            ? 'bg-[#0d47a1] text-white shadow-sm shadow-[#0d47a1]/25'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {pageNum}
                    </button>
                );
            })}

            {/* Next Page Button */}
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer shadow-2xs"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}